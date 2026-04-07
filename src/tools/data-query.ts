import { z } from "zod";
import { execSync } from "child_process";
import { DataTable } from "../components/DataTable.js";
import type { ToolComponentBinding } from "../types.js";

export const dataQueryTool: ToolComponentBinding<
  { query: string; columns?: string[] },
  { columns: string[]; rows: Record<string, string | number>[]; title: string }
> = {
  name: "dataQuery",
  description:
    "Run a shell command and display the output as a formatted table. Use for querying system info, listing processes, checking disk usage, etc.",
  inputSchema: z.object({
    query: z.string().describe("Shell command to execute (e.g. 'ps aux', 'df -h')"),
    columns: z.array(z.string()).optional().describe("Column headers for the output"),
  }).shape,
  execute: async ({ query, columns: userColumns }: { query: string; columns?: string[] }) => {
    try {
      const output = execSync(query, {
        encoding: "utf-8",
        timeout: 10000,
        stdio: ["pipe", "pipe", "pipe"],
      });
      const lines = output
        .trim()
        .split("\n")
        .filter((l) => l.trim());

      if (lines.length === 0) {
        return { columns: userColumns || ["output"], rows: [], title: query };
      }

      const headers = userColumns || lines[0].split(/\s{2,}|\t/);
      const dataLines = userColumns ? lines : lines.slice(1);

      const rows = dataLines.map((line) => {
        const parts = line.split(/\s{2,}|\t/);
        const row: Record<string, string | number> = {};
        headers.forEach((h: string, i: number) => {
          const val = parts[i]?.trim() || "";
          const num = Number(val);
          row[h] = isNaN(num) ? val : num;
        });
        return row;
      });

      return { columns: headers, rows, title: `$ ${query}` };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        columns: ["error"],
        rows: [{ error: errMsg.slice(0, 200) || "command failed" }],
        title: `$ ${query}`,
      };
    }
  },
  component: DataTable,
};
