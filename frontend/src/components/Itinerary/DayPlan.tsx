import type { DayPlan as DayPlanType } from '../../types'
import { ActivityItem } from './ActivityItem'

interface Props {
  dayPlan: DayPlanType
  index: number
}

const dayColors = [
  { bg: 'rgba(198, 123, 92, 0.08)', border: 'var(--terracotta)', text: 'var(--terracotta)' },
  { bg: 'rgba(139, 157, 119, 0.08)', border: 'var(--sage)', text: 'var(--sage)' },
  { bg: 'rgba(59, 130, 160, 0.08)', border: 'var(--ocean-blue)', text: 'var(--ocean-blue)' },
  { bg: 'rgba(212, 165, 116, 0.08)', border: 'var(--gold)', text: 'var(--gold)' },
]

export function DayPlan({ dayPlan, index }: Props) {
  const colorScheme = dayColors[index % dayColors.length]
  const delay = index * 0.15

  return (
    <div className="day-plan" style={{ animationDelay: `${delay}s` }}>
      {/* 日期标记 */}
      <div className="day-marker">
        <div
          className="day-number"
          style={{
            background: colorScheme.bg,
            borderColor: colorScheme.border,
            color: colorScheme.text,
          }}
        >
          <span className="day-label">DAY</span>
          <span className="day-num">{dayPlan.day}</span>
        </div>
        {dayPlan.date && (
          <span className="day-date">{dayPlan.date}</span>
        )}
      </div>

      {/* 活动列表 */}
      <div className="activities-container">
        {dayPlan.activities.map((activity, i) => (
          <ActivityItem
            key={i}
            activity={activity}
            index={i}
            colorScheme={colorScheme}
          />
        ))}
      </div>

      <style>{`
        .day-plan {
          display: flex;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
          animation: fadeInUp 0.5s ease-out both;
          position: relative;
        }

        .day-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
          min-width: 60px;
          position: relative;
          z-index: 2;
        }

        .day-number {
          width: 56px;
          height: 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid;
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s ease;
        }

        .day-number:hover {
          transform: scale(1.1);
        }

        .day-label {
          font-size: 0.55rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          line-height: 1;
        }

        .day-num {
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1;
          margin-top: 2px;
        }

        .day-date {
          font-size: 0.7rem;
          color: var(--slate);
          white-space: nowrap;
        }

        .activities-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        @media (max-width: 480px) {
          .day-plan {
            flex-direction: column;
          }

          .day-marker {
            flex-direction: row;
            gap: var(--space-md);
          }

          .day-number {
            width: 40px;
            height: 40px;
          }

          .day-label {
            font-size: 0.45rem;
          }

          .day-num {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
