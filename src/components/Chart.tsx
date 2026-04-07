import React, { type FC } from "react";
import { Box, Text } from "ink";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: {
    title?: string;
    points: DataPoint[];
    type?: "bar" | "horizontal";
    maxLabelWidth?: number;
  };
  isLoading?: boolean;
}

export const Chart: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Rendering chart...</Text>;
  }

  const { title, points, type = "horizontal", maxLabelWidth = 15 } = data;
  if (!points || points.length === 0) {
    return <Text dimColor>No data to chart</Text>;
  }

  const maxVal = Math.max(...points.map((p) => p.value));
  const barWidth = 30;

  if (type === "horizontal") {
    return (
      <Box flexDirection="column" paddingX={1}>
        {title && <Text bold>{title}</Text>}
        {points.map((p) => {
          const filled = maxVal > 0 ? Math.round((p.value / maxVal) * barWidth) : 0;
          const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
          return (
            <Box key={p.label}>
              <Text>{p.label.padEnd(maxLabelWidth)}</Text>
              <Text color="cyan">{bar}</Text>
              <Text dimColor> {p.value}</Text>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {title && <Text bold>{title}</Text>}
      <Text dimColor>{"(vertical chart support coming soon)"}</Text>
      {points.map((p) => (
        <Text key={p.label}>
          <Text>{p.label}: </Text>
          <Text color="cyan">{p.value}</Text>
        </Text>
      ))}
    </Box>
  );
};
