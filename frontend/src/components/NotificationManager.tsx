import { Alert, Snackbar, Stack } from '@mui/material'
import type { Notification } from '../hooks/useNotification'

interface NotificationManagerProps {
  notifications: Notification[]
  onClose: (id: string) => void
}

export function NotificationManager({ notifications, onClose }: NotificationManagerProps) {
  return (
    <Stack
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
      }}
      spacing={1}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => onClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ position: 'relative', top: 'auto', right: 'auto' }}
        >
          <Alert
            onClose={() => onClose(notification.id)}
            severity={notification.type === 'info' ? 'info' : notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  )
}
