interface Props {
  activeTab: 'itinerary' | 'weather' | 'transport' | 'budget'
  onTabChange: (tab: 'itinerary' | 'weather' | 'transport' | 'budget') => void
}

const TABS = [
  { key: 'itinerary' as const, label: '行程' },
  { key: 'weather' as const, label: '天气' },
  { key: 'transport' as const, label: '交通' },
  { key: 'budget' as const, label: '预算' },
]

export function ResultTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="result-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}

      <style>{`
        .result-tabs {
          display: flex;
          gap: var(--space-xs);
          padding: 0 var(--space-xl);
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid rgba(212, 165, 116, 0.15);
        }

        .tab-button {
          padding: var(--space-sm) var(--space-lg);
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 0.9rem;
          color: var(--slate);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Noto Serif SC', serif;
          font-weight: 400;
        }

        .tab-button:hover {
          color: var(--terracotta);
          background: rgba(198, 123, 92, 0.05);
        }

        .tab-button.active {
          color: var(--terracotta);
          border-bottom-color: var(--terracotta);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
