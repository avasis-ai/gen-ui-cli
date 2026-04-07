import React, { type FC } from "react";
import { Box, Text } from "ink";

interface Row {
  [key: string]: string | number;
}

interface Props {
  data: {
    columns: string[];
    rows: Row[];
    title: string;
  };
  isLoading?: boolean;
}

export const DataTable: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Loading data...</Text>;
  }

  const { columns, rows, title } = data;
  if (!rows || rows.length === 0) {
    return <Text dimColor>No data</Text>;
  }

  const colWidths = columns.map((col) => {
    const maxData = Math.max(
      ...rows.map((r) => String(r[col] ?? "").length)
    );
    return Math.max(col.length, maxData);
  });

  const headerLine = columns
    .map((col, i) => col.padEnd(colWidths[i]))
    .join(" │ ");

  const separatorLine = colWidths.map((w) => "─".repeat(w)).join("─┼─");

  return (
    <Box flexDirection="column" paddingX={1}>
      {title && (
        <Box marginBottom={0}>
          <Text bold>
            {title}
          </Text>
        </Box>
      )}
      <Text bold color="cyan">{headerLine}</Text>
      <Text dimColor>{separatorLine}</Text>
      {rows.map((row, idx) => (
        <Text key={idx}>
          {columns
            .map((col, i) => {
              const val = String(row[col] ?? "");
              return val.padEnd(colWidths[i]);
            })
            .join(" │ ")}
        </Text>
      ))}
      <Text dimColor>{separatorLine}</Text>
      <Text dimColor>{rows.length} row(s)</Text>
    </Box>
  );
};
