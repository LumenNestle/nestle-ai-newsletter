import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import type { BlockInstance } from "../../../../../packages/shared/src/types/block.types";

interface Props {
  block: BlockInstance;
  editMode?: boolean;
}

export function Example1Renderer({ block, editMode = false }: Props) {
    return (
      <Card
        sx={{
          width: "100%",
          alignSelf: "center",
          borderRadius: 0,
          //boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          //border: "1px solid",
          //borderColor: "divider",
          transition: "all 0.15s ease-in-out",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            transform: "translateY(-1.5px)",
          },
        }}
      >
{/*CATEGORY: BASE ASSETS*/}
        {/*/Image Only*/}
        <CardMedia
          component="img"
          image="https://placehold.co/150x80/e0e0e0/9e9e9e?text=Image"
          alt="Placeholder"
          sx={{ width: "100%", display: "block", objectFit: "cover" }}
        />
        {/*/Text  Only*/}
        <CardContent sx={{ width: "90%", mx: "auto", px: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {block.content ??
              "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident blanditiis omnis natus ratione necessitatibus consequuntur eum voluptas iure repellat voluptate, nisi ipsam explicabo fugit architecto sint adipisci, facilis inventore! Error."}
          </Typography>
        </CardContent>

        {/*/Call To Action Filled*/}
        <CardActions sx={{ p: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            disableElevation
            fullWidth
            sx={{ borderRadius: 1.5, textTransform: "none" }}
          >
            Click here
          </Button>
        </CardActions>

        {/*/Call To Action Empty*/}
        <CardActions sx={{ p: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            disableElevation
            fullWidth
            sx={{ borderRadius: 1.5, textTransform: "none" }}
          >
            Click here
          </Button>
        </CardActions>
        {/*⚠️MISSING: TEXT LABEL*/}

{/*CATEGORY: STRUCTURAL ASSETS*/}

{/*CATEGORY: DIVIDERS ASSETS*/}

{/*CATEGORY: CONTENT ASSETS*/}

{/*CATEGORY: MULTIMEDIA ASSETS*/}
        {/*/Image with Background*/}
        <Box
          sx={{
            width: "90%",
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            backgroundImage:
              'url("https://plus.unsplash.com/premium_photo-1701842912302-501bfc88c403?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            py: 5,
            mb: 1.5,
          }}
        >
          <CardMedia
            component="img"
            image="https://placehold.co/150x80/e0e0e0/9e9e9e?text=Image"
            alt="Placeholder"
            sx={{
              width: "80%",
              objectFit: "cover",
              borderRadius: 1, // Optional: softens the edges of the inner image
            }}
          />
        </Box>

{/*CATEGORY: ICONS ASSETS*/}
        {/*/Icon and Text*/}
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <DescriptionIcon fontSize="large" color="action" />
              <Typography variant="body2" color="text.secondary">
                {block.content ??
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </Typography>
            </Box>
          </Box>
        </CardContent>

{/*CATEGORY: SPECIAL ASSETS*/}
      </Card>
    );
}
