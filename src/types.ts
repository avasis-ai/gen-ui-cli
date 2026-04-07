import React, { type ReactNode, type FC } from "react";

export interface ToolComponentBinding<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: TInput) => Promise<TOutput>;
  component: FC<{ data: TOutput; isLoading?: boolean }>;
}

export interface GenUIConfig {
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
  tools: ToolComponentBinding[];
  maxSteps?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallRender[];
}

export interface ToolCallRender {
  id: string;
  toolName: string;
  state: "loading" | "streaming" | "complete" | "error";
  input?: unknown;
  output?: unknown;
  error?: string;
  componentName?: string;
}
