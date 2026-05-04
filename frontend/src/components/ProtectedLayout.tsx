import { Box } from '@mui/material'
import { Navigation } from './Navigation'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
