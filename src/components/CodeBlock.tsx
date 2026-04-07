import React, { type FC } from "react";
import { Box, Text } from "ink";

interface Props {
  data: {
    code: string;
    language: string;
    filename: string;
    lineStart: number;
  };
  isLoading?: boolean;
}

export const CodeBlock: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Generating code...</Text>;
  }

  const { code, language, filename, lineStart = 1 } = data;
  const lines = code.split("\n");

  return (
    <Box flexDirection="column" paddingX={1}>
      {(filename || language) && (
        <Box>
          <Text dimColor>
            {"// "}{filename || `snippet.${language || "txt"}`}
          </Text>
        </Box>
      )}
      <Box flexDirection="column">
        {lines.map((line, i) => (
          <Box key={i}>
            <Text dimColor>{String(lineStart + i).padStart(3)} │ </Text>
            <Text>{line}</Text>
          </Box>
        ))}
      </Box>
      <Text dimColor>{lines.length} line(s)</Text>
    </Box>
  );
};
