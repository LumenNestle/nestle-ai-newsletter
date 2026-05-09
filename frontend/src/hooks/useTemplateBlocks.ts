import { useState, useCallback } from "react";
import { saveBlocks } from "../api/blocks";
import type { BlockDefinitionDTO, BlockInstance } from "../../../packages/shared/src/types/block.types";

    export function useTemplateBlocks() {
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);

    const addBlock = useCallback((def: BlockDefinitionDTO) => {
        setBlocks((prev) => [
        ...prev,
        {
            localId: crypto.randomUUID(),
            type: def.type,
            content: def.defaultContent,
            mustFill: def.mustFill,
            displayOrder: prev.length,
        },
        ]);
    }, []);

    const removeBlock = useCallback((localId: string) => {
        setBlocks((prev) => prev.filter((b) => b.localId !== localId));
    }, []);

    const saveTemplate = useCallback(
        async (templateId: string) => {
        await saveBlocks(
            templateId,
            blocks.map(({ localId, ...rest }) => rest),
        );
        },
        [blocks],
    );

    return { blocks, addBlock, removeBlock, saveTemplate };
}
