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

## Agent Patterns

GenUI-CLI is designed for autonomous agents that need visual feedback while running 24/7.

### Autonomous Monitoring

For background monitoring without user interaction:

```tsx
import { AutonomousMonitor } from "./examples/autonomous-monitoring";

const monitor = new AutonomousMonitor({
  checkInterval: 30000, // 30 seconds
  alertThreshold: { cpu: 80, memory: 85, disk: 90 },
  logPath: "./monitoring.log",
});

await monitor.start(); // Runs continuously, logs health checks
```

### Snapshot-Based Reporting

Generate visual reports on demand:

```tsx
const { GenUIChat } = "@avasis-ai/gen-ui-cli";

// Capture snapshot without rendering to terminal
const chat = new GenUIChat(config);
const snapshot = await chat.executeTool("systemStatusTool", {});

// Use snapshot data for alerts, dashboards, or log files
```

### Batch Processing with Visual Feedback

Process multiple tasks with progress indicators:

```tsx
import { ProgressBar } from "@avasis-ai/gen-ui-cli/components";

const tasks = ["task1", "task2", "task3"];
render(
  <ProgressBar
    current={0}
    total={tasks.length}
    label="Processing"
  />
);
```

### Examples

- [examples/agent-workflow.tsx](examples/agent-workflow.tsx) - Agent status dashboards and task progress
- [examples/autonomous-monitoring.tsx](examples/autonomous-monitoring.tsx) - 24/7 system monitoring with alerts
- [examples/demo.tsx](examples/demo.tsx) - Interactive chat with generative UI

## License

MIT

---

**Building production AI agents?** [SynthCode Pro](https://whop.com/checkout/plan_KspZxhIoW87gd) — 8 neurosymbolic verification gates, model fallback chains, semantic caching, observability. $149 once.
