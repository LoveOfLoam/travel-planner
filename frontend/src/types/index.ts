export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  agent_id?: string
}

export interface ChatSession {
  session_id: string
  trip_id?: string
  messages: Message[]
}

export interface Activity {
  time: string
  title: string
  location?: {
    type: string
    coordinates: number[]
  }
  description: string
  cost: number
  duration: string
  transport: string
}

export interface DayPlan {
  day: number
  date?: string
  activities: Activity[]
}

export interface Trip {
  id: string
  title: string
  destination: string
  start_date?: string
  end_date?: string
  budget: number
  num_people: number
  status: 'planning' | 'confirmed' | 'completed'
  itinerary: DayPlan[]
  created_at: string
}

// 6 种细粒度意图类型
export type IntentType =
  | 'itinerary_planning'
  | 'weather_query'
  | 'transport_query'
  | 'poi_search'
  | 'budget_advice'
  | 'general'

// 天气数据
export interface WeatherDay {
  date?: string
  day: number
  weather: string
  temperature: string
  suggestion?: string
}

export interface WeatherInfo {
  destination?: string
  forecast: WeatherDay[]
}

// 交通方案
export interface TransportOption {
  type: string
  duration: string
  cost: string
  description?: string
  recommended?: boolean
}

export interface TransportInfo {
  origin?: string
  destination?: string
  options: TransportOption[]
}

// 景点/餐厅
export interface POIItem {
  name: string
  address?: string
  rating?: number
  description?: string
  category?: string
  tags?: string[]
}

// 预算分析
export interface BudgetBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface BudgetInfo {
  total_budget: number
  breakdown: BudgetBreakdown[]
  tips?: string[]
}

// 统一结果容器
export interface TripResult {
  intent: IntentType
  summary: string
  trip?: Trip
  weather?: WeatherInfo
  transport?: TransportInfo
  pois?: POIItem[]
  budget?: BudgetInfo
}

export type AgentEventType =
  | 'thinking'
  | 'intent_parsed'
  | 'dispatching'
  | 'agent_start'
  | 'agent_progress'
  | 'agent_complete'
  | 'aggregating'
  | 'complete'

export interface AgentEvent {
  type: AgentEventType
  agent_id?: string
  progress?: number
  data?: Record<string, unknown>
  timestamp: number
}

export interface ParsedIntent {
  destination?: string
  days?: number
  budget?: number
  people?: number
  origin?: string
  must_visit?: string[]
  summary?: string
}

export type AgentStatus = 'pending' | 'running' | 'complete' | 'error'

export interface AgentInfo {
  id: string
  label: string
  iconId: string
  status: AgentStatus
  message: string
}
