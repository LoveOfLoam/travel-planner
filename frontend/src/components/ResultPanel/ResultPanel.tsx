import { useState } from 'react'
import { useTripStore } from '../../stores/tripStore'
import { ItineraryCard } from '../Itinerary/ItineraryCard'
import { ResultTabs } from './ResultTabs'
import { WeatherCard } from './WeatherCard'
import { TransportCard } from './TransportCard'
import { POICard } from './POICard'
import { BudgetCard } from './BudgetCard'

export function ResultPanel() {
  const { currentResult } = useTripStore()
  const [activeTab, setActiveTab] = useState<'itinerary' | 'weather' | 'transport' | 'budget'>('itinerary')

  // 无结果 → 空状态
  if (!currentResult || currentResult.intent === 'general') {
    return <EmptyState />
  }

  // 行程规划：显示 tabs + 对应子视图
  if (currentResult.intent === 'itinerary_planning') {
    return (
      <div className="result-panel">
        <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="result-content">
          {activeTab === 'itinerary' && currentResult.trip && (
            <ItineraryCard trip={currentResult.trip} />
          )}
          {activeTab === 'itinerary' && !currentResult.trip && (
            <EmptyState />
          )}
          {activeTab === 'weather' && currentResult.weather && (
            <WeatherCard weather={currentResult.weather} />
          )}
          {activeTab === 'weather' && !currentResult.weather && (
            <NoDataHint text="暂无天气数据" />
          )}
          {activeTab === 'transport' && currentResult.transport && (
            <TransportCard transport={currentResult.transport} />
          )}
          {activeTab === 'transport' && !currentResult.transport && (
            <NoDataHint text="暂无交通方案" />
          )}
          {activeTab === 'budget' && currentResult.budget && (
            <BudgetCard budget={currentResult.budget} />
          )}
          {activeTab === 'budget' && !currentResult.budget && (
            <NoDataHint text="暂无预算数据" />
          )}
        </div>

        <style>{`
          .result-panel {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .result-content {
            flex: 1;
            overflow-y: auto;
            padding: 0 var(--space-md);
          }
        `}</style>
      </div>
    )
  }

  // 其他意图：显示对应卡片
  return (
    <div className="result-panel">
      <div className="result-content">
        {currentResult.intent === 'weather_query' && currentResult.weather && (
          <WeatherCard weather={currentResult.weather} />
        )}
        {currentResult.intent === 'transport_query' && currentResult.transport && (
          <TransportCard transport={currentResult.transport} />
        )}
        {currentResult.intent === 'poi_search' && currentResult.pois && (
          <POICard pois={currentResult.pois} destination={undefined} />
        )}
        {currentResult.intent === 'budget_advice' && currentResult.budget && (
          <BudgetCard budget={currentResult.budget} />
        )}
      </div>

      <style>{`
        .result-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .result-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-md);
        }
      `}</style>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="compass-icon">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--gold)" strokeWidth="2" opacity="0.4"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="var(--terracotta)" strokeWidth="1" opacity="0.3"/>
          <path d="M50 20 L55 45 L50 50 L45 45 Z" fill="var(--terracotta)" opacity="0.7"/>
          <path d="M50 80 L45 55 L50 50 L55 55 Z" fill="var(--sage)" opacity="0.7"/>
          <path d="M20 50 L45 45 L50 50 L45 55 Z" fill="var(--gold)" opacity="0.5"/>
          <path d="M80 50 L55 55 L50 50 L55 45 Z" fill="var(--ocean-blue)" opacity="0.5"/>
          <circle cx="50" cy="50" r="4" fill="var(--terracotta)"/>
        </svg>
      </div>
      <h2 className="empty-title">旅途手记</h2>
      <p className="empty-subtitle">在对话中告诉我你的旅行梦想</p>
      <div className="empty-hints">
        <span className="hint-tag">北京故宫</span>
        <span className="hint-tag">江南水乡</span>
        <span className="hint-tag">西北大环线</span>
        <span className="hint-tag">云南丽江</span>
      </div>

      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          animation: fadeIn 1s ease-out;
        }

        .compass-icon {
          animation: float 6s ease-in-out infinite;
          margin-bottom: var(--space-xl);
          opacity: 0.8;
        }

        .empty-title {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 3rem;
          color: var(--charcoal);
          margin-bottom: var(--space-sm);
          letter-spacing: 8px;
        }

        .empty-subtitle {
          font-size: 1.1rem;
          color: var(--slate);
          margin-bottom: var(--space-xl);
          font-weight: 300;
        }

        .empty-hints {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
          justify-content: center;
        }

        .hint-tag {
          padding: var(--space-sm) var(--space-md);
          background: rgba(198, 123, 92, 0.08);
          border: 1px dashed var(--gold);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--terracotta);
          transition: all 0.3s ease;
        }

        .hint-tag:hover {
          background: rgba(198, 123, 92, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

function NoDataHint({ text }: { text: string }) {
  return (
    <div className="no-data-hint">
      <p>{text}</p>
      <style>{`
        .no-data-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: var(--slate);
          font-size: 0.95rem;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
