import { z } from "zod";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { FileTree } from "../components/FileTree.js";
import type { ToolComponentBinding } from "../types.js";

interface FileNode {
  name: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

function walkDir(dir: string, depth: number = 0, maxDepth: number = 3): FileNode[] {
  if (depth >= maxDepth) return [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const nodes: FileNode[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const fullPath = join(dir, entry.name);
      const stat = statSync(fullPath);
      if (entry.isDirectory()) {
        const children = walkDir(fullPath, depth + 1, maxDepth);
        nodes.push({ name: entry.name, type: "directory", size: stat.size, children });
      } else {
        nodes.push({ name: entry.name, type: "file", size: stat.size });
      }
    }
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
}

export const fileExplorerTool: ToolComponentBinding<
  { path: string; maxDepth?: number },
  { files: FileNode[]; path: string }
> = {
  name: "fileExplorer",
  description: "List and explore directory structure. Returns a file tree with sizes.",
  inputSchema: z.object({
    path: z.string().describe("Directory path to explore"),
    maxDepth: z.number().optional().describe("Max depth to traverse (default 3)"),
  }).shape,
  execute: async ({ path, maxDepth }: { path: string; maxDepth?: number }) => {
    const files = walkDir(path, 0, maxDepth || 3);
    return { files, path };
  },
  component: FileTree,
};
