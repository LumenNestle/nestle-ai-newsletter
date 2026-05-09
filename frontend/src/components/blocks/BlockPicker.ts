import { Card, CardContent, Grid, Icon, Typography } from "@mui/material";
import { useBlockDefinitions } from "../../hooks/useBlockDefinitions";
import { BlockContentType } from "../../../../packages/shared/src/types/block.types";
import { useBlockDefinitions } from "../../hooks/useBlockDefinitions"; 

export function BlockPicker({
    onSelect,
    }: {
    onSelect: (type: BlockContentType) => void;
    }) {
    const { data: definitions } = useBlockDefinitions();

    return (
        <Grid container spacing={2}>
        {definitions?.map((def) => (
            <Grid item key={def.type}>
            <Card onClick={() => onSelect(def.type)} sx={{ cursor: "pointer" }}>
                <CardContent>
                <Icon>{def.icon}</Icon>
                <Typography>{def.label}</Typography>
                <Typography variant="caption">{def.description}</Typography>
                </CardContent>
            </Card>
            </Grid>
        ))}
        </Grid>
    );
}