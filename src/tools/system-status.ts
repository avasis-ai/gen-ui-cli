import { z } from "zod";
import { execSync } from "child_process";
import os from "os";
import { StatusGrid } from "../components/StatusGrid.js";
import type { ToolComponentBinding } from "../types.js";

export const systemStatusTool: ToolComponentBinding<
  void,
  { items: Array<{ label: string; status: "ok" | "warn" | "err" | "pending" | "running"; detail?: string }>; title: string }
> = {
  name: "systemStatus",
  description:
    "Check system health: CPU, memory, disk, network, and running services. Renders as a status grid.",
  inputSchema: z.object({}).shape,
  execute: async () => {
    const items: Array<{ label: string; status: "ok" | "warn" | "err" | "pending" | "running"; detail?: string }> = [];

    try {
      const mem = os.totalmem();
      const free = os.freemem();
      const memPct = ((mem - free) / mem) * 100;
      items.push({
        label: "Memory",
        status: memPct > 90 ? "err" : memPct > 70 ? "warn" : "ok",
        detail: `${((mem - free) / 1024 / 1024 / 1024).toFixed(1)}GB / ${(mem / 1024 / 1024 / 1024).toFixed(1)}GB (${memPct.toFixed(0)}%)`,
      });
    } catch {
      items.push({ label: "Memory", status: "err", detail: "failed to read" });
    }

    try {
      const loadAvg = os.loadavg();
      items.push({
        label: "CPU Load",
        status: loadAvg[0] > 4 ? "err" : loadAvg[0] > 2 ? "warn" : "ok",
        detail: `${loadAvg[0].toFixed(2)} (1m) ${loadAvg[1].toFixed(2)} (5m)`,
      });
    } catch {
      items.push({ label: "CPU Load", status: "err", detail: "failed to read" });
    }

    try {
      const uptime = os.uptime();
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      items.push({
        label: "Uptime",
        status: uptime > 86400 ? "ok" : "warn",
        detail: `${hours}h ${mins}m`,
      });
    } catch {}

    try {
      const df = execSync("df -h / 2>/dev/null", { encoding: "utf-8" }).trim();
      const parts = df.split("\n")[1]?.split(/\s+/);
      if (parts && parts.length >= 5) {
        const usePct = parseInt(parts[4]);
        items.push({
          label: "Disk (/)",
          status: usePct > 95 ? "err" : usePct > 80 ? "warn" : "ok",
          detail: `${parts[2]} / ${parts[1]} (${parts[4]})`,
        });
      }
    } catch {
      items.push({ label: "Disk", status: "pending", detail: "unknown" });
    }

    try {
      const result = execSync("curl -s -o /dev/null -w '%{http_code}' http://localhost:11434/api/tags 2>/dev/null", {
        encoding: "utf-8",
        timeout: 3000,
      });
      items.push({
        label: "Ollama",
        status: result.trim() === "200" ? "ok" : "err",
        detail: result.trim() === "200" ? "running" : `status ${result.trim()}`,
      });
    } catch {
      items.push({ label: "Ollama", status: "err", detail: "not running" });
    }

    try {
      const result = execSync("curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/api/stats 2>/dev/null", {
        encoding: "utf-8",
        timeout: 3000,
      });
      items.push({
        label: "Avasis Forge",
        status: result.trim() === "200" ? "ok" : "err",
        detail: result.trim() === "200" ? "running" : `status ${result.trim()}`,
      });
    } catch {
      items.push({ label: "Avasis Forge", status: "err", detail: "not running" });
    }

    return { items, title: "System Status" };
  },
  component: StatusGrid,
};
