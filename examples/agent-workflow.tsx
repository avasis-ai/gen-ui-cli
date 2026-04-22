/**
 * Autonomous Agent Workflow with Generative UI
 *
 * This example demonstrates how gen-ui-cli can be used in autonomous agent workflows.
 * The LLM decides what UI components to show based on the task at hand.
 *
 * Perfect for:
 * - Agent status dashboards
 * - Task progress visualization
 * - Real-time tool execution feedback
 * - Autonomous system monitoring
 */

import React, { useState, useEffect } from "react";
import { render } from "ink";
import { GenUIChat } from "@avasis-ai/gen-ui-cli";

/**
 * Custom agent status component
 */
const AgentStatus = ({ status, tasks, metrics }: {
  status: string;
  tasks: Array<{ id: string; name: string; done: boolean }>;
  metrics: { memory: string; cpu: string; uptime: string };
}) => (
  <Box flexDirection="column" borderStyle="single" padding={1}>
    <Text bold color="cyan">🤖 Autonomous Agent Status</Text>
    <Text>──────────────────────────</Text>
    <Text>State: {status}</Text>
    <Text>──────────────────────────</Text>

    <Text bold color="yellow">Active Tasks:</Text>
    {tasks.map(task => (
      <Text key={task.id}>
        {task.done ? <Text color="green">✓</Text> : <Text color="blue">○</Text>} {task.name}
      </Text>
    ))}

    <Text>──────────────────────────</Text>
    <Text bold color="yellow">Metrics:</Text>
    <Text>Memory: {metrics.memory}</Text>
    <Text>CPU: {metrics.cpu}</Text>
    <Text>Uptime: {metrics.uptime}</Text>
  </Box>
);

/**
 * Custom task progress component
 */
const TaskProgress = ({ tasks, currentStep }: {
  tasks: string[];
  currentStep: number;
}) => (
  <Box flexDirection="column" borderStyle="round" padding={1}>
    <Text bold>Task Progress</Text>
    <Text>──────────────────────────</Text>
    {tasks.map((task, idx) => (
      <Text key={idx}>
        {idx < currentStep ? (
          <Text color="green">✓</Text>
        ) : idx === currentStep ? (
          <Text color="yellow">→</Text>
        ) : (
          <Text dim>○</Text>
        )} {task}
      </Text>
    ))}
  </Box>
);

/**
 * Custom tool output component
 */
const ToolOutput = ({ toolName, output, duration }: {
  toolName: string;
  output: string;
  duration: number;
}) => (
  <Box flexDirection="column" borderStyle="double" padding={1}>
    <Text bold color="magenta">Tool: {toolName}</Text>
    <Text dim>Duration: {duration}ms</Text>
    <Text>──────────────────────────</Text>
    <Text>{output}</Text>
  </Box>
);

/**
 * Tool bindings for autonomous agent
 */
const autonomousAgentTools = {
  /**
   * Show agent status
   */
  showAgentStatus: {
    name: "showAgentStatus",
    description: "Display current agent status, active tasks, and system metrics",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Current agent state" },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              done: { type: "boolean" },
            },
          },
        },
        metrics: {
          type: "object",
          properties: {
            memory: { type: "string" },
            cpu: { type: "string" },
            uptime: { type: "string" },
          },
        },
      },
      required: ["status", "tasks", "metrics"],
    },
    component: AgentStatus,
  },

  /**
   * Show task progress
   */
  showTaskProgress: {
    name: "showTaskProgress",
    description: "Display progress through a multi-step task",
    inputSchema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: { type: "string" },
        },
        currentStep: { type: "number" },
      },
      required: ["tasks", "currentStep"],
    },
    component: TaskProgress,
  },

  /**
   * Show tool output
   */
  showToolOutput: {
    name: "showToolOutput",
    description: "Display the output of a tool execution",
    inputSchema: {
      type: "object",
      properties: {
        toolName: { type: "string" },
        output: { type: "string" },
        duration: { type: "number" },
      },
      required: ["toolName", "output", "duration"],
    },
    component: ToolOutput,
  },
};

/**
 * Autonomous agent workflow
 *
 * This demonstrates an agent that autonomously:
 * 1. Analyzes a codebase
 * 2. Identifies issues
 * 3. Fixes them
 * 4. Reports progress with visual feedback
 */
function AutonomousAgentWorkflow() {
  const [workflowState, setWorkflowState] = useState({
    step: 0,
    status: "initializing",
    tasks: [
      { id: "1", name: "Scan codebase", done: false },
      { id: "2", name: "Analyze issues", done: false },
      { id: "3", name: "Fix problems", done: false },
      { id: "4", name: "Verify changes", done: false },
    ],
    metrics: { memory: "0%", cpu: "0%", uptime: "0s" },
  });

  useEffect(() => {
    // Simulate autonomous workflow
    const simulateWorkflow = async () => {
      // Step 1: Scan
      await sleep(1000);
      setWorkflowState(prev => ({
        ...prev,
        step: 1,
        status: "scanning",
        tasks: prev.tasks.map(t =>
          t.id === "1" ? { ...t, done: true } : t
        ),
      }));

      // Step 2: Analyze
      await sleep(1000);
      setWorkflowState(prev => ({
        ...prev,
        step: 2,
        status: "analyzing",
        tasks: prev.tasks.map(t =>
          t.id === "2" ? { ...t, done: true } : t
        ),
      }));

      // Step 3: Fix
      await sleep(1000);
      setWorkflowState(prev => ({
        ...prev,
        step: 3,
        status: "fixing",
        tasks: prev.tasks.map(t =>
          t.id === "3" ? { ...t, done: true } : t
        ),
      }));

      // Step 4: Verify
      await sleep(1000);
      setWorkflowState(prev => ({
        ...prev,
        step: 4,
        status: "complete",
        tasks: prev.tasks.map(t =>
          t.id === "4" ? { ...t, done: true } : t
        ),
      }));
    };

    simulateWorkflow();
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">🤖 Autonomous Agent Workflow</Text>
      <Text>──────────────────────────</Text>

      <GenUIChat
        config={{
          model: "gemma4:e4b",
          baseUrl: "http://localhost:11434",
          systemPrompt: [
            "You are an autonomous agent workflow assistant.",
            "",
            "You can show:",
            "- Agent status with showAgentStatus",
            "- Task progress with showTaskProgress",
            "- Tool output with showToolOutput",
            "",
            "The workflow automatically progresses through steps.",
            "Show appropriate UI for each stage.",
          ].join("\n"),
          tools: Object.values(autonomousAgentTools),
          maxSteps: 5,
        }}
      />
    </Box>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the workflow
render(<AutonomousAgentWorkflow />);
