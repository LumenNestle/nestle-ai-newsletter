import type { BlockInstance } from "../../../../packages/shared/src/types/block.types";
import { Example1Renderer } from "./renderers/Example1Renderer";
import { Example2Renderer } from "./renderers/Example2Renderer";

interface Props {block: BlockInstance; editMode?: boolean;}

export function BlockRenderer({ block }: { block: BlockInstance }) {
  switch (block.type) {
    case "example1":
      return <Example1Renderer block={block} />;
    case "example2":
      return <Example2Renderer block={block} />;
    default:
      return null;
  }
}
