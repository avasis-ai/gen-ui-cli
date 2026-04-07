import React, { type FC } from "react";
import { Box, Text } from "ink";

interface StatusItem {
  label: string;
  status: "ok" | "warn" | "err" | "pending" | "running";
  detail?: string;
}

interface Props {
  data: {
    items: StatusItem[];
    title: string;
  };
  isLoading?: boolean;
}

const STATUS_ICON: Record<StatusItem["status"], string> = {
  ok: "✓",
  warn: "⚠",
  err: "✗",
  pending: "○",
  running: "◆",
};

const STATUS_COLOR: Record<StatusItem["status"], string> = {
  ok: "green",
  warn: "yellow",
  err: "red",
  pending: "gray",
  running: "cyan",
};

export const StatusGrid: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Checking status...</Text>;
  }

  const { items, title } = data;

  return (
    <Box flexDirection="column" paddingX={1}>
      {title && <Box marginBottom={0}><Text bold>{title}</Text></Box>}
      {items.map((item) => (
        <Box key={item.label}>
          <Text color={STATUS_COLOR[item.status]}>
            {STATUS_ICON[item.status]}{" "}
          </Text>
          <Text>{item.label}</Text>
          {item.detail && (
            <Text dimColor> — {item.detail}</Text>
          )}
        </Box>
      ))}
    </Box>
  );
};
