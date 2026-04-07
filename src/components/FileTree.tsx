import React, { type FC } from "react";
import { Box, Text } from "ink";

interface FileNode {
  name: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

interface Props {
  data: { files: FileNode[]; path: string };
  isLoading?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function renderNode(node: FileNode, depth: number = 0): React.ReactNode {
  const prefix = "  ".repeat(depth);
  const icon = node.type === "directory" ? "📁" : "📄";
  const color = node.type === "directory" ? "cyan" : "white";
  const sizeStr = node.size ? ` (${formatSize(node.size)})` : "";

  return (
    <Box key={node.name} flexDirection="column">
      <Text color={color}>
        {prefix}{icon} {node.name}
        <Text dimColor>{sizeStr}</Text>
      </Text>
      {node.children?.map((child) => renderNode(child, depth + 1))}
    </Box>
  );
}

export const FileTree: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Loading files...</Text>;
  }

  const { files, path } = data;
  if (!files || files.length === 0) {
    return <Text dimColor>No files found</Text>;
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      {path && (
        <Box marginBottom={0}>
          <Text dimColor bold>
            {path}
          </Text>
        </Box>
      )}
      <Box flexDirection="column" marginTop={0}>
        {files.map((f) => renderNode(f))}
      </Box>
    </Box>
  );
};
