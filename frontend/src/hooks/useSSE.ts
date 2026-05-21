import { useEffect, useRef } from 'react'
import { useAgentStore } from '../stores/agentStore'
import { createSSEConnection } from '../services/sse'

export function useSSE(sessionId: string | null) {
  const { addEvent, setRunning } = useAgentStore()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const eventSource = createSSEConnection(
      sessionId,
      (event) => {
        addEvent(event)
        if (event.type === 'agent_complete') {
          setRunning(false)
        }
      },
      () => {
        setRunning(false)
      }
    )

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [sessionId, addEvent, setRunning])

  return eventSourceRef.current
}
