import type { Activity } from '../../types'

interface Props {
  activity: Activity
  index: number
  colorScheme: {
    bg: string
    border: string
    text: string
  }
}

export function ActivityItem({ activity, index, colorScheme }: Props) {
  const delay = index * 0.08

  return (
    <div
      className="activity-item"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 时间标签 */}
      <div className="activity-time" style={{ color: colorScheme.text }}>
        {activity.time}
      </div>

      {/* 连接点 */}
      <div className="activity-dot" style={{ background: colorScheme.border }}>
        <div className="dot-pulse" style={{ background: colorScheme.border }} />
      </div>

      {/* 内容卡片 */}
      <div className="activity-card">
        <div className="card-header">
          <h4 className="activity-title">{activity.title}</h4>
          {activity.cost > 0 && (
            <span className="activity-cost" style={{ color: colorScheme.text }}>
              ¥{activity.cost}
            </span>
          )}
        </div>

        {activity.description && (
          <p className="activity-description">{activity.description}</p>
        )}

        <div className="activity-meta">
          {activity.duration && (
            <span className="meta-badge">
              <span className="badge-icon">⏱</span>
              {activity.duration}
            </span>
          )}
          {activity.transport && (
            <span className="meta-badge">
              <span className="badge-icon">🚶</span>
              {activity.transport}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          animation: fadeIn 0.4s ease-out both;
          position: relative;
        }

        .activity-time {
          min-width: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: right;
          padding-top: var(--space-md);
          font-family: 'Georgia', serif;
        }

        .activity-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
          margin-top: var(--space-md);
          flex-shrink: 0;
          z-index: 2;
        }

        .dot-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          opacity: 0.15;
          animation: pulse 2s ease-in-out infinite;
        }

        .activity-card {
          flex: 1;
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-md) var(--space-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(212, 165, 116, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .activity-card::before {
          content: '';
          position: absolute;
          left: -8px;
          top: var(--space-lg);
          width: 12px;
          height: 12px;
          background: white;
          border-left: 1px solid rgba(212, 165, 116, 0.1);
          border-bottom: 1px solid rgba(212, 165, 116, 0.1);
          transform: rotate(45deg);
        }

        .activity-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
          border-color: rgba(212, 165, 116, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
        }

        .activity-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--charcoal);
          margin: 0;
          line-height: 1.4;
        }

        .activity-cost {
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'Georgia', serif;
          white-space: nowrap;
          margin-left: var(--space-md);
        }

        .activity-description {
          font-size: 0.85rem;
          color: var(--slate);
          margin: 0 0 var(--space-sm);
          line-height: 1.6;
        }

        .activity-meta {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background: var(--parchment);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--slate);
        }

        .badge-icon {
          font-size: 0.8rem;
        }

        @media (max-width: 480px) {
          .activity-item {
            flex-wrap: wrap;
          }

          .activity-time {
            min-width: auto;
            text-align: left;
            padding-top: 0;
            font-size: 0.75rem;
            order: -1;
            width: 100%;
            padding-bottom: var(--space-xs);
          }

          .activity-dot {
            display: none;
          }

          .activity-card {
            width: 100%;
          }

          .activity-card::before {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
