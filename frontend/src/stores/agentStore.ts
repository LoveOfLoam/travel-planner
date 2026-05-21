import { create } from 'zustand'
import type { AgentEvent, AgentInfo, AgentStatus, ParsedIntent } from '../types'

interface AgentState {
  events: AgentEvent[]
  isRunning: boolean
  overallProgress: number
  phase: 'idle' | 'thinking' | 'dispatching' | 'running' | 'aggregating' | 'complete'
  parsedIntent: ParsedIntent | null
  agents: AgentInfo[]
  intentType: string | null
  addEvent: (event: AgentEvent) => void
  setRunning: (running: boolean) => void
  clearEvents: () => void
}

const DEFAULT_AGENTS: AgentInfo[] = [
  { id: 'itinerary', label: '行程规划', iconId: 'map', status: 'pending', message: '' },
  { id: 'budget', label: '预算分析', iconId: 'wallet', status: 'pending', message: '' },
  { id: 'transport', label: '交通查询', iconId: 'train', status: 'pending', message: '' },
  { id: 'weather', label: '天气预报', iconId: 'sun', status: 'pending', message: '' },
]

export const useAgentStore = create<AgentState>((set) => ({
  events: [],
  isRunning: false,
  overallProgress: 0,
  phase: 'idle',
  parsedIntent: null,
  agents: [],
  intentType: null,
  addEvent: (event) =>
    set((state) => {
      const newEvents = [...state.events, event]
      let phase = state.phase
      let parsedIntent = state.parsedIntent
      let agents = state.agents
      let overallProgress = state.overallProgress
      let intentType = state.intentType

      switch (event.type) {
        case 'thinking':
          phase = 'thinking'
          break

        case 'intent_parsed':
          parsedIntent = {
            destination: event.data?.destination as string | undefined,
            days: event.data?.days as number | undefined,
            budget: event.data?.budget as number | undefined,
            people: event.data?.people as number | undefined,
            origin: event.data?.origin as string | undefined,
            must_visit: event.data?.must_visit as string[] | undefined,
            summary: event.data?.summary as string | undefined,
          }
          break

        case 'dispatching': {
          phase = 'dispatching'
          const activeIds = (event.data?.active_agents as string[]) || []
          agents = activeIds.length > 0
            ? DEFAULT_AGENTS
                .filter(a => activeIds.includes(a.id))
                .map(a => ({ ...a, status: 'pending' as AgentStatus, message: '' }))
            : []
          break
        }

        case 'agent_start':
          phase = 'running'
          agents = agents.map(a =>
            a.id === event.agent_id
              ? { ...a, status: 'running' as AgentStatus, message: (event.data?.message as string) || '' }
              : a
          )
          break

        case 'agent_progress':
          agents = agents.map(a =>
            a.id === event.agent_id
              ? { ...a, message: (event.data?.message as string) || a.message }
              : a
          )
          break

        case 'agent_complete': {
          const status: AgentStatus = event.data?.status === 'error' ? 'error' : 'complete'
          agents = agents.map(a =>
            a.id === event.agent_id
              ? { ...a, status, message: (event.data?.message as string) || a.message }
              : a
          )
          // Update progress based on completed agents
          const completed = agents.filter(a => a.status === 'complete' || a.status === 'error').length
          overallProgress = Math.round((completed / agents.length) * 100)
          break
        }

        case 'aggregating':
          phase = 'aggregating'
          overallProgress = 95
          break

        case 'complete':
          phase = 'complete'
          overallProgress = 100
          intentType = (event.data?.intent as string) || null
          break
      }

      return {
        events: newEvents,
        phase,
        parsedIntent,
        agents,
        overallProgress,
        intentType,
      }
    }),
  setRunning: (running) => set({ isRunning: running }),
  clearEvents: () => set({
    events: [],
    overallProgress: 0,
    phase: 'idle',
    parsedIntent: null,
    agents: [],
    intentType: null,
  }),
}))
