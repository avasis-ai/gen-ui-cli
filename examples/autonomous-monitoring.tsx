/**
 * Autonomous Monitoring with Generative UI
 *
 * This example demonstrates how gen-ui-cli can be used for autonomous agents
 * that run continuously, monitoring systems and alerting when issues arise.
 *
 * Key patterns:
 * 1. Non-interactive mode for autonomous operation
 * 2. Automated health checks with visual output
 * 3. Snapshot-based monitoring (periodic snapshots without interactive input)
 * 4. Alert triggers when thresholds are exceeded
 */

import React from "react";
import { render } from "ink";
import { GenUIChat } from "@avasis-ai/gen-ui-cli";
import { systemStatusTool } from "@avasis-ai/gen-ui-cli/tools";
import fs from "fs/promises";
import path from "path";

interface MonitoringConfig {
  checkInterval: number; // milliseconds
  alertThreshold: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
  };
  logPath: string;
}

interface HealthSnapshot {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
  alerts: string[];
}

/**
 * Autonomous health monitor that runs without user interaction
 */
class AutonomousMonitor {
  private config: MonitoringConfig;
  private snapshots: HealthSnapshot[] = [];
  private isRunning = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  /**
   * Run a single health check and return the snapshot
   */
  async runHealthCheck(): Promise<HealthSnapshot> {
    const timestamp = Date.now();

    // Simulate getting system status (in real use, call systemStatusTool)
    // For this example, we'll use the GenUIChat but capture output
    const snapshot: HealthSnapshot = {
      timestamp,
      cpu: Math.random() * 100, // In real use: actual CPU %
      memory: Math.random() * 100, // In real use: actual memory %
      disk: Math.random() * 100, // In real use: actual disk %
      alerts: [],
    };

    // Check thresholds
    if (snapshot.cpu > this.config.alertThreshold.cpu) {
      snapshot.alerts.push(`CPU critical: ${snapshot.cpu.toFixed(1)}%`);
    }
    if (snapshot.memory > this.config.alertThreshold.memory) {
      snapshot.alerts.push(`Memory critical: ${snapshot.memory.toFixed(1)}%`);
    }
    if (snapshot.disk > this.config.alertThreshold.disk) {
      snapshot.alerts.push(`Disk critical: ${snapshot.disk.toFixed(1)}%`);
    }

    this.snapshots.push(snapshot);

    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Format snapshot as text for logging/alerting
   */
  formatSnapshot(snapshot: HealthSnapshot): string {
    const time = new Date(snapshot.timestamp).toISOString();
    let output = `[${time}] Health Check\n`;
    output += `  CPU: ${snapshot.cpu.toFixed(1)}%\n`;
    output += `  Memory: ${snapshot.memory.toFixed(1)}%\n`;
    output += `  Disk: ${snapshot.disk.toFixed(1)}%\n`;

    if (snapshot.alerts.length > 0) {
      output += `  ⚠️  ALERTS:\n`;
      snapshot.alerts.forEach(alert => {
        output += `    - ${alert}\n`;
      });
    }

    return output;
  }

  /**
   * Save snapshot to log file
   */
  async logSnapshot(snapshot: HealthSnapshot): Promise<void> {
    const logEntry = this.formatSnapshot(snapshot) + "\n";
    await fs.appendFile(this.config.logPath, logEntry);
  }

  /**
   * Start continuous monitoring
   */
  async start(): Promise<void> {
    this.isRunning = true;
    console.log(`Starting autonomous monitoring (interval: ${this.config.checkInterval}ms)`);
    console.log(`Alert thresholds: CPU ${this.config.alertThreshold.cpu}%, Memory ${this.config.alertThreshold.memory}%, Disk ${this.config.alertThreshold.disk}%`);

    while (this.isRunning) {
      try {
        const snapshot = await this.runHealthCheck();
        await this.logSnapshot(snapshot);

        // Print alerts to console for immediate visibility
        if (snapshot.alerts.length > 0) {
          console.error("\n" + this.formatSnapshot(snapshot));
        }

        // Wait for next check
        await new Promise(resolve => setTimeout(resolve, this.config.checkInterval));
      } catch (error) {
        console.error("Health check failed:", error);
        // Continue despite errors (resilience pattern)
      }
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
    console.log("\nMonitoring stopped");
  }

  /**
   * Get recent snapshots
   */
  getRecentSnapshots(count: number = 10): HealthSnapshot[] {
    return this.snapshots.slice(-count);
  }

  /**
   * Generate health report
   */
  generateReport(): string {
    const recent = this.getRecentSnapshots(10);
    const avgCpu = recent.reduce((sum, s) => sum + s.cpu, 0) / recent.length;
    const avgMemory = recent.reduce((sum, s) => sum + s.memory, 0) / recent.length;
    const avgDisk = recent.reduce((sum, s) => sum + s.disk, 0) / recent.length;
    const totalAlerts = recent.reduce((sum, s) => sum + s.alerts.length, 0);

    let report = "=== Autonomous Monitor Report ===\n";
    report += `Last 10 checks (last hour)\n`;
    report += `  Average CPU: ${avgCpu.toFixed(1)}%\n`;
    report += `  Average Memory: ${avgMemory.toFixed(1)}%\n`;
    report += `  Average Disk: ${avgDisk.toFixed(1)}%\n`;
    report += `  Total Alerts: ${totalAlerts}\n`;

    return report;
  }
}

/**
 * Example usage
 */
async function main() {
  const config: MonitoringConfig = {
    checkInterval: 30000, // 30 seconds
    alertThreshold: {
      cpu: 80,
      memory: 85,
      disk: 90,
    },
    logPath: path.join(process.cwd(), "monitoring.log"),
  };

  const monitor = new AutonomousMonitor(config);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nReceived shutdown signal...");
    monitor.stop();
    console.log("\n" + monitor.generateReport());
    process.exit(0);
  });

  // Run for 2 minutes then stop (for demo purposes)
  // In production, remove this timeout and run indefinitely
  setTimeout(() => {
    monitor.stop();
    console.log("\n" + monitor.generateReport());
    process.exit(0);
  }, 120000);

  await monitor.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutonomousMonitor, HealthSnapshot, MonitoringConfig };
