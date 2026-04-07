# gen-ui-cli

Generative UI for terminals. The first framework that lets LLM tool calls render as interactive Ink (React) components in your CLI.

## What is Generative UI?

Generative UI is the process of allowing an LLM to go beyond text and "generate UI". Vercel AI SDK introduced this for web apps (tool calls render as React components). This library brings the same concept to **terminals** using [Ink](https://github.com/vadimdemedes/ink).

## How it works

```
User types: "check system health"
    |
    v
Gemma 4 decides to call systemStatus tool
    |
    v
Tool executes, returns: { memory: "14%", cpu: "0.10", disk: "46%" }
    |
    v
Result renders as <StatusGrid> component with colored checkmarks
    |
    v
Gemma 4 summarizes: "System health is good"
```

The LLM **chooses** what UI to show. A file search renders a file tree. A system check renders a status grid. A code request renders a code block with line numbers.

## Install

```bash
npm install @avasis-ai/gen-ui-cli
```

Requires a running Ollama instance (or any OpenAI-compatible API) with a model that supports tool calling (Gemma 4, Llama 3.1+, Qwen 2.5+, etc.).

## Quick start

```tsx
import React from "react";
import { render } from "ink";
import { GenUIChat } from "@avasis-ai/gen-ui-cli";
import { systemStatusTool } from "@avasis-ai/gen-ui-cli/tools";
import { fileExplorerTool } from "@avasis-ai/gen-ui-cli/tools";
import { codeViewerTool } from "@avasis-ai/gen-ui-cli/tools";

render(
  <GenUIChat
    config={{
      model: "gemma4:e4b",
      baseUrl: "http://localhost:11434",
      systemPrompt: "You are a terminal AI assistant. Use tools to display rich data.",
      tools: [systemStatusTool, fileExplorerTool, codeViewerTool],
      maxSteps: 5,
    }}
  />
);
```

## Built-in components

| Component | Tool | What it renders |
|-----------|------|-----------------|
| `<StatusGrid>` | `systemStatusTool` | System health with colored status indicators |
| `<FileTree>` | `fileExplorerTool` | Directory tree with file sizes |
| `<DataTable>` | `dataQueryTool` | Formatted tables from shell command output |
| `<CodeBlock>` | `codeViewerTool` | Source code with line numbers |
| `<ProgressBar>` | (custom) | Task progress bars |
| `<Chart>` | (custom) | ASCII bar charts |
| `<DiffView>` | (custom) | Git diff display |

## Creating custom tools

A tool is a binding between an LLM tool definition and an Ink component:

```tsx
import type { ToolComponentBinding } from "@avasis-ai/gen-ui-cli";
import { Box, Text } from "ink";

const myTool: ToolComponentBinding<{ query: string }, { results: string[] }> = {
  name: "searchFiles",
  description: "Search for files matching a pattern",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
    },
    required: ["query"],
  },
  execute: async ({ query }) => {
    // Your logic here
    return { results: ["file1.ts", "file2.ts"] };
  },
  component: ({ data }) => (
    <Box flexDirection="column">
      {data.results.map((r) => (
        <Text key={r}>  {r}</Text>
      ))}
    </Box>
  ),
};
```

## How it differs from Vercel AI SDK Gen UI

| | Vercel AI SDK | gen-ui-cli |
|---|---|---|
| Rendering | React DOM (browser) | Ink (terminal) |
| Tool format | AI SDK tools | Ollama native tool_calls |
| Components | Any React component | Any Ink component |
| Input | Text input / buttons | Terminal keyboard |
| Provider | OpenAI, Anthropic, etc. | Ollama, any OpenAI-compatible API |

## Requirements

- Node.js 18+
- Ollama (or any OpenAI-compatible API) running locally or remotely
- A model that supports tool calling

## License

MIT
