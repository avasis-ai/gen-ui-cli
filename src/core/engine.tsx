import React, { type FC } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { useState, useRef, useCallback } from "react";
import { MessageRenderer } from "./message-renderer.js";
import type { GenUIConfig, ChatMessage, ToolCallRender, ToolComponentBinding } from "../types.js";

interface Props {
  config: GenUIConfig;
}

interface OllamaToolCall {
  id?: string;
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
  tool_call_id?: string;
}

export const GenUIChat: FC<Props> = ({ config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const { exit } = useApp();

  const toolRegistry = useRef(
    new Map<string, ToolComponentBinding>(
      config.tools.map((t: ToolComponentBinding) => [t.name, t])
    )
  );

  const processMessage = useCallback(
    async (userText: string) => {
      setIsProcessing(true);
      setStreamingText("");

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
      };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);

      const ollamaMessages: OllamaMessage[] = [
        {
          role: "system",
          content: `${config.systemPrompt || "You are a helpful CLI assistant."}

Available tools:
${config.tools.map((t: ToolComponentBinding) => `- ${t.name}: ${t.description}`).join("\n")}

Use tools whenever they can provide richer, more structured information than plain text. After receiving tool results, respond with a summary.`,
        },
      ];

      for (const m of messages) {
        ollamaMessages.push({ role: m.role as "user" | "assistant", content: m.content });
      }
      ollamaMessages.push({ role: "user", content: userText });

      let allToolRenders: ToolCallRender[] = [];
      let fullResponse = "";
      let stepsLeft = config.maxSteps || 5;

      while (stepsLeft-- > 0) {
        try {
          const baseUrl = config.baseUrl || "http://localhost:11434";
          const res = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: config.model,
              messages: ollamaMessages,
              stream: true,
              tools: config.tools.map((t: ToolComponentBinding) => ({
                type: "function",
                function: {
                  name: t.name,
                  description: t.description,
                  parameters: t.inputSchema,
                },
              })),
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "unknown error");
            fullResponse = `API error: ${errText}`;
            break;
          }

          const reader = res.body?.getReader();
          if (!reader) {
            fullResponse = "No response stream";
            break;
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let modelResponse = "";
          let toolCalls: OllamaToolCall[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const chunk = JSON.parse(line);
                if (chunk.message?.content) {
                  modelResponse += chunk.message.content;
                  setStreamingText(modelResponse);
                }
                if (chunk.message?.tool_calls) {
                  toolCalls = chunk.message.tool_calls;
                }
              } catch {}
            }
          }

          fullResponse = modelResponse;
          setStreamingText("");

          const hasToolCalls = toolCalls.length > 0;

          if (!hasToolCalls) {
            ollamaMessages.push({ role: "assistant", content: modelResponse });
            break;
          }

          ollamaMessages.push({
            role: "assistant",
            content: modelResponse,
            tool_calls: toolCalls,
          });

          for (const tc of toolCalls) {
            const callId = tc.id || `call_${Date.now()}`;
            const toolRender: ToolCallRender = {
              id: callId,
              toolName: tc.function.name,
              state: "loading",
              input: tc.function.arguments,
            };
            allToolRenders = [...allToolRenders, toolRender];
            setMessages((prev) => [
              ...prev.slice(0, -1),
              {
                ...prev[prev.length - 1],
                content: "",
                toolCalls: [...allToolRenders],
              },
            ]);

            const binding = toolRegistry.current.get(tc.function.name);
            if (binding) {
              try {
                const result = await binding.execute(tc.function.arguments);
                toolRender.state = "complete";
                toolRender.output = result;
                ollamaMessages.push({
                  role: "tool",
                  content: JSON.stringify(result),
                  tool_call_id: callId,
                });
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                toolRender.state = "error";
                toolRender.error = msg;
                ollamaMessages.push({
                  role: "tool",
                  content: JSON.stringify({ error: msg }),
                  tool_call_id: callId,
                });
              }
            } else {
              toolRender.state = "error";
              toolRender.error = `Unknown tool: ${tc.function.name}`;
              ollamaMessages.push({
                role: "tool",
                content: JSON.stringify({ error: `Unknown tool: ${tc.function.name}` }),
                tool_call_id: callId,
              });
            }

            allToolRenders = [...allToolRenders];
            setMessages((prev) => [
              ...prev.slice(0, -1),
              {
                ...prev[prev.length - 1],
                toolCalls: [...allToolRenders],
              },
            ]);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          fullResponse = `Error: ${msg}`;
          break;
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: fullResponse || last.content,
            toolCalls: allToolRenders,
          };
        } else {
          updated.push({
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: fullResponse,
            toolCalls: allToolRenders,
          });
        }
        return updated;
      });

      setIsProcessing(false);
      setStreamingText("");
    },
    [messages, config]
  );

  useInput((char, key) => {
    if (char === "q" && !input && !isProcessing) {
      exit();
      return;
    }

    if (key.return) {
      if (!input.trim() || isProcessing) return;
      const text = input.trim();
      setInput("");
      processMessage(text);
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (key.ctrl && char === "c") {
      exit();
      return;
    }

    if (!key.ctrl && !key.meta && char) {
      setInput((prev) => prev + char);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          avasis gen-ui
        </Text>
        <Text dimColor>{" — generative terminal interface (press q to quit)"}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg: ChatMessage) => (
          <MessageRenderer
            key={msg.id}
            message={msg}
            toolRegistry={toolRegistry.current}
          />
        ))}
        {streamingText && (
          <Box>
            <Text dimColor>{streamingText}</Text>
            <Text color="cyan">{"\u2588"}</Text>
          </Box>
        )}
      </Box>

      <Box>
        <Text color="green">{">"}</Text>
        <Text>{input}</Text>
        {isProcessing && !streamingText && <Text dimColor> {"\u25AE"}</Text>}
      </Box>
    </Box>
  );
};
