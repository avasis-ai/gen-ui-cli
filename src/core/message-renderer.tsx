import React, { type FC } from "react";
import { Box, Text } from "ink";
import type { ToolComponentBinding, ToolCallRender, ChatMessage } from "../types.js";

interface Props {
  message: ChatMessage;
  toolRegistry: Map<string, ToolComponentBinding>;
}

export const MessageRenderer: FC<Props> = ({ message, toolRegistry }) => {
  if (message.role === "user") {
    return (
      <Box marginBottom={1}>
        <Text dimColor>{"❯ "}</Text>
        <Text>{message.content}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      {message.content && (
        <Text wrap="wrap">{message.content}</Text>
      )}
      {message.toolCalls?.map((tc: ToolCallRender) => {
        const binding = toolRegistry.get(tc.toolName);
        const Component = binding?.component;

        if (tc.state === "loading") {
          return (
            <Box key={tc.id} marginTop={1} paddingX={1}>
              <Text dimColor>
                ◆ {tc.toolName}...
              </Text>
            </Box>
          );
        }

        if (tc.state === "error") {
          return (
            <Box key={tc.id} marginTop={1} paddingX={1}>
              <Text color="red">✗ {tc.toolName}: {tc.error}</Text>
            </Box>
          );
        }

        if (Component && tc.output) {
          return (
            <Box key={tc.id} marginTop={1} flexDirection="column">
              <Text dimColor color="cyan" bold>
                ◆ {tc.toolName}
              </Text>
              <Box marginTop={0}>
                <Component data={tc.output} isLoading={tc.state === "streaming"} />
              </Box>
            </Box>
          );
        }

        return (
          <Box key={tc.id} marginTop={1} paddingX={1} flexDirection="column">
            <Text dimColor color="cyan">◆ {tc.toolName}</Text>
            <Text dimColor>{JSON.stringify(tc.output, null, 2)}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
