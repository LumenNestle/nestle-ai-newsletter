import { Box, Skeleton, Typography } from "@mui/material";
import type { BlockInstance } from "../../../../../packages/shared/src/types/block.types";

interface Props {
  block: BlockInstance;
  editMode?: boolean;
}

export function Example1Renderer({ block, editMode = false }: Props) {
  return (
    <Box
      sx={{
        p: 2,
        border: editMode ? "1px dashed" : "none",
        borderColor: "divider",
        borderRadius: 1,
        minHeight: 80,
        width: "100%",
      }}
    >
      {block.content ? (
        <Typography variant="body1">{block.content}</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      )}
    </Box>
  );
}
