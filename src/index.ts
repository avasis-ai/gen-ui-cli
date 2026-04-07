export { GenUIChat } from "./core/engine.js";
export { MessageRenderer } from "./core/message-renderer.js";
export { FileTree } from "./components/FileTree.js";
export { DataTable } from "./components/DataTable.js";
export { ProgressBar } from "./components/ProgressBar.js";
export { CodeBlock } from "./components/CodeBlock.js";
export { Chart } from "./components/Chart.js";
export { DiffView } from "./components/DiffView.js";
export { StatusGrid } from "./components/StatusGrid.js";
export { fileExplorerTool } from "./tools/file-explorer.js";
export { dataQueryTool } from "./tools/data-query.js";
export { codeViewerTool } from "./tools/code-viewer.js";
export { systemStatusTool } from "./tools/system-status.js";
export type {
  GenUIConfig,
  ChatMessage,
  ToolCallRender,
  ToolComponentBinding,
} from "./types.js";

import { render } from "ink";
import React from "react";
import { GenUIChat } from "./core/engine.js";
import type { GenUIConfig } from "./types.js";

export async function createGenUI(config: GenUIConfig) {
  const { waitUntilExit } = render(
    React.createElement(GenUIChat, { config })
  );
  return { waitUntilExit };
}
