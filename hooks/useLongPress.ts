import { useRef, useState, useCallback } from 'react'

interface UseLongPressOptions {
  duration?: number
  onLongPress?: () => void
}

export function useLongPress({ duration = 500, onLongPress }: UseLongPressOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [isLongPressing, setIsLongPressing] = useState(false)

  const handlePointerDown = useCallback(() => {
    setIsLongPressing(false)
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true)
      onLongPress?.()
    }, duration)
  }, [duration, onLongPress])

  const handlePointerUp = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLongPressing(false)
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsLongPressing(false)
  }, [])

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
    isLongPressing,
  }
}
