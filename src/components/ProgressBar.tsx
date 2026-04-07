import React, { type FC } from "react";
import { Box, Text } from "ink";

interface Props {
  data: {
    label?: string;
    current: number;
    total: number;
    unit?: string;
  };
  isLoading?: boolean;
}

export const ProgressBar: FC<Props> = ({ data, isLoading }) => {
  const { label, current, total, unit = "" } = data;
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const width = 30;
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);

  const color = pct >= 100 ? "green" : pct >= 50 ? "yellow" : "red";

  return (
    <Box flexDirection="column" paddingX={1}>
      {label && (
        <Text>
          {label}
        </Text>
      )}
      <Box>
        <Text color={color}>{bar}</Text>
        <Text> {current}/{total}{unit} ({pct.toFixed(1)}%)</Text>
      </Box>
    </Box>
  );
};
