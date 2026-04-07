import React, { type FC } from "react";
import { Box, Text } from "ink";

interface DiffHunk {
  oldStart: number;
  newStart: number;
  content: string;
}

interface Props {
  data: {
    file: string;
    hunks: DiffHunk[];
    additions?: number;
    deletions?: number;
  };
  isLoading?: boolean;
}

export const DiffView: FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Text dimColor>Computing diff...</Text>;
  }

  const { file, hunks, additions = 0, deletions = 0 } = data;

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box>
        <Text bold>{file}</Text>
        <Text color="green"> +{additions}</Text>
        <Text color="red"> -{deletions}</Text>
      </Box>
      {hunks.map((hunk, hi) => (
        <Box key={hi} flexDirection="column">
          {hunk.content.split("\n").map((line, li) => {
            let color: string | undefined;
            let prefix = " ";
            if (line.startsWith("+")) {
              color = "green";
              prefix = "+";
            } else if (line.startsWith("-")) {
              color = "red";
              prefix = "-";
            } else if (line.startsWith("@@")) {
              color = "cyan";
            }
            return (
              <Text key={li} color={color}>
                {prefix} {line.slice(1)}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
