import { useChatStore } from '../stores/chatStore'
import { useAgentStore } from '../stores/agentStore'
import { useTripStore } from '../stores/tripStore'
import { sendMessage } from '../services/api'
import { createSSEConnection } from '../services/sse'
import type { Message, IntentType, TripResult } from '../types'

export function useChat() {
  const { sessionId, messages, isLoading, setSessionId, addMessage, setLoading } = useChatStore()
  const { addEvent, setRunning, clearEvents } = useAgentStore()
  const { setResult } = useTripStore()

  const send = async (content: string) => {
    // 生成 session ID
    const currentSessionId = sessionId || crypto.randomUUID()
    if (!sessionId) {
      setSessionId(currentSessionId)
    }

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    addMessage(userMessage)
    setLoading(true)
    setRunning(true)
    clearEvents()

    // 先建立 SSE 连接，再发送 POST
    const eventSource = createSSEConnection(
      currentSessionId,
      (event) => {
        addEvent(event)

        // 收到完成事件：解析结果，添加助手消息，关闭连接
        if (event.type === 'complete') {
          const responseText = (event.data?.response_text as string) || '规划完成！'
          const tripData = event.data?.trip_data as Record<string, unknown> | undefined
          const intent = (event.data?.intent as IntentType) || 'general'

          const assistantMessage: Message = {
            role: 'assistant',
            content: responseText,
            timestamp: new Date().toISOString(),
          }
          addMessage(assistantMessage)

          // 根据意图构建统一结果
          const result: TripResult = {
            intent,
            summary: responseText,
            trip: tripData?.itinerary
              ? { ...(tripData as unknown as import('../types').Trip), id: '', title: '', destination: '', budget: 0, num_people: 1, status: 'planning' as const, created_at: '' }
              : undefined,
            weather: tripData?.weather as import('../types').WeatherInfo | undefined,
            transport: tripData?.transport as import('../types').TransportInfo | undefined,
            pois: tripData?.pois as import('../types').POIItem[] | undefined,
            budget: tripData?.budget as import('../types').BudgetInfo | undefined,
          }
          setResult(result)

          setRunning(false)
          setLoading(false)
          eventSource.close()
        }
      },
      () => {
        setRunning(false)
        setLoading(false)
        eventSource.close()
      }
    )

    // 发送 POST（触发后台编排，不等待结果）
    try {
      await sendMessage(currentSessionId, content)
    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage({
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后重试。',
        timestamp: new Date().toISOString(),
      })
      setRunning(false)
      setLoading(false)
      eventSource.close()
    }
  }

  return { messages, isLoading, send }
}
