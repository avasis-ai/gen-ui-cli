import { z } from "zod";
import { readFileSync } from "fs";
import { CodeBlock } from "../components/CodeBlock.js";
import type { ToolComponentBinding } from "../types.js";

export const codeViewerTool: ToolComponentBinding<
  { filePath: string; startLine?: number; endLine?: number },
  { code: string; filename: string; language: string; lineStart: number }
> = {
  name: "codeViewer",
  description:
    "Read and display a source file with line numbers. Shows a formatted code block in the terminal.",
  inputSchema: z.object({
    filePath: z.string().describe("Path to the file to read"),
    startLine: z.number().optional().describe("Start line number"),
    endLine: z.number().optional().describe("End line number"),
  }).shape,
  execute: async ({ filePath, startLine, endLine }: { filePath: string; startLine?: number; endLine?: number }) => {
    try {
      const content = readFileSync(filePath, "utf-8");
      const ext = filePath.split(".").pop() || "txt";
      const allLines = content.split("\n");

      const start = (startLine || 1) - 1;
      const end = endLine ? Math.min(endLine, allLines.length) : allLines.length;
      const code = allLines.slice(start, end).join("\n");

      return {
        code,
        filename: filePath.split("/").pop() || filePath,
        language: ext,
        lineStart: startLine || 1,
      };
    } catch (err: unknown) {
      return {
        code: `Error: ${err instanceof Error ? err.message : String(err)}`,
        filename: filePath,
        language: "txt",
        lineStart: 1,
      };
    }
  },
  component: CodeBlock,
};
