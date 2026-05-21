import type { AgentEvent, AgentEventType } from '../types'

const ALL_EVENT_TYPES: AgentEventType[] = [
  'thinking', 'intent_parsed', 'dispatching',
  'agent_start', 'agent_progress', 'agent_complete',
  'aggregating', 'complete',
]

export function createSSEConnection(
  sessionId: string,
  onEvent: (event: AgentEvent) => void,
  onError?: (error: Event) => void
): EventSource {
  const eventSource = new EventSource(`/api/v1/chat/${sessionId}/stream`)

  const handleEvent = (type: string) => (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      onEvent({ type, ...data } as AgentEvent)
    } catch (e) {
      console.error('Failed to parse SSE event:', e)
    }
  }

  for (const type of ALL_EVENT_TYPES) {
    eventSource.addEventListener(type, handleEvent(type))
  }

  eventSource.onerror = (event) => {
    console.error('SSE error:', event)
    onError?.(event)
  }

  return eventSource
}
