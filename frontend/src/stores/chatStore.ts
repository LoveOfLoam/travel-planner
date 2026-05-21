import { create } from 'zustand'
import type { Message } from '../types'

interface ChatState {
  sessionId: string | null
  messages: Message[]
  isLoading: boolean
  setSessionId: (id: string) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [], sessionId: null }),
}))
