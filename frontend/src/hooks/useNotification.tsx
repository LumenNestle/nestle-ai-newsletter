/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  timestamp: number
}

interface AlertContextType {
  notifications: Notification[]
  addNotification: (message: string, type?: NotificationType, duration?: number) => string
  removeNotification: (id: string) => void
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info', duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`
      const notification: Notification = {
        id,
        message,
        type,
        timestamp: Date.now(),
      }

      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        window.setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    [removeNotification],
  )

  const success = useCallback(
    (message: string, duration?: number) => addNotification(message, 'success', duration),
    [addNotification],
  )

  const error = useCallback(
    (message: string, duration?: number) => addNotification(message, 'error', duration),
    [addNotification],
  )

  const warning = useCallback(
    (message: string, duration?: number) => addNotification(message, 'warning', duration),
    [addNotification],
  )

  const info = useCallback(
    (message: string, duration?: number) => addNotification(message, 'info', duration),
    [addNotification],
  )

  const value: AlertContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}

export function useNotification() {
  const context = useContext(AlertContext)

  if (!context) {
    throw new Error('useNotification must be used within AlertProvider')
  }

  return context
}
