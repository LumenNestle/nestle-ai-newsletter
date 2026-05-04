import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button 
} from '@mui/material';

interface ModalDeleteProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ModalDelete({
  open,
  title = "¿Confirmar eliminación?",
  description = "Esta acción lo eliminará de forma permanente.",
  onClose,
  onConfirm,
  loading = false,
}: ModalDeleteProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? "Eliminando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}