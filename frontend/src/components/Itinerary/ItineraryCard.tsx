import type { Trip } from '../../types'
import { DayPlan } from './DayPlan'

interface Props {
  trip: Trip
}

export function ItineraryCard({ trip }: Props) {
  return (
    <div className="itinerary-card">
      {/* 顶部车票样式头部 */}
      <div className="ticket-header">
        <div className="ticket-left">
          <div className="ticket-stamp">
            <span className="stamp-text">旅</span>
          </div>
          <div className="ticket-info">
            <h2 className="trip-title">{trip.title || trip.destination + '之旅'}</h2>
            <div className="trip-meta">
              <span className="meta-item">
                <span className="meta-icon">📍</span>
                {trip.destination}
              </span>
              <span className="meta-divider">|</span>
              <span className="meta-item">
                <span className="meta-icon">👥</span>
                {trip.num_people} 人
              </span>
              <span className="meta-divider">|</span>
              <span className="meta-item">
                <span className="meta-icon">💰</span>
                ¥{trip.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="ticket-right">
          <div className="ticket-perforation" />
          <div className="ticket-details">
            {trip.start_date && (
              <div className="detail-row">
                <span className="detail-label">出发</span>
                <span className="detail-value">{trip.start_date}</span>
              </div>
            )}
            {trip.end_date && (
              <div className="detail-row">
                <span className="detail-label">返回</span>
                <span className="detail-value">{trip.end_date}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">天数</span>
              <span className="detail-value">{trip.itinerary.length} 天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 行程内容 */}
      {trip.itinerary.length > 0 ? (
        <div className="itinerary-content">
          {/* 时间线 */}
          <div className="timeline">
            <div className="timeline-line" />
            {trip.itinerary.map((dayPlan, i) => (
              <DayPlan key={dayPlan.day} dayPlan={dayPlan} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-itinerary">
          <div className="empty-compass">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 4"/>
              <path d="M40 15 L44 35 L40 40 L36 35 Z" fill="var(--terracotta)" opacity="0.7"/>
              <path d="M40 65 L36 45 L40 40 L44 45 Z" fill="var(--sage)" opacity="0.7"/>
              <circle cx="40" cy="40" r="3" fill="var(--terracotta)"/>
            </svg>
          </div>
          <p className="empty-text">等待行程规划...</p>
        </div>
      )}

      {/* 底部装饰 */}
      <div className="ticket-footer">
        <div className="footer-line" />
        <span className="footer-text">旅途手记 · AI 旅行规划</span>
        <div className="footer-line" />
      </div>

      <style>{`
        .itinerary-card {
          max-width: 800px;
          margin: 0 auto;
          animation: fadeInUp 0.6s ease-out;
        }

        .ticket-header {
          display: flex;
          background: white;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(212, 165, 116, 0.2);
          margin-bottom: var(--space-xl);
          position: relative;
        }

        .ticket-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--terracotta), var(--gold), var(--sage));
        }

        .ticket-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl);
        }

        .ticket-stamp {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--terracotta);
          border-radius: 50%;
          animation: stamp 0.8s ease-out;
        }

        .stamp-text {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 2rem;
          color: var(--terracotta);
          transform: rotate(-15deg);
        }

        .ticket-info {
          flex: 1;
        }

        .trip-title {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.8rem;
          color: var(--charcoal);
          margin-bottom: var(--space-sm);
          letter-spacing: 4px;
        }

        .trip-meta {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          font-size: 0.85rem;
          color: var(--slate);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .meta-icon {
          font-size: 0.9rem;
        }

        .meta-divider {
          color: var(--gold);
          opacity: 0.4;
        }

        .ticket-right {
          display: flex;
          align-items: stretch;
        }

        .ticket-perforation {
          width: 1px;
          background: repeating-linear-gradient(
            180deg,
            var(--gold) 0px,
            var(--gold) 6px,
            transparent 6px,
            transparent 12px
          );
          opacity: 0.4;
          margin: var(--space-md) 0;
        }

        .ticket-details {
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: var(--space-sm);
          min-width: 140px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--slate);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .detail-value {
          font-size: 0.9rem;
          color: var(--charcoal);
          font-weight: 600;
        }

        .itinerary-content {
          padding: 0 var(--space-md);
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline-line {
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--terracotta), var(--gold), var(--sage));
          opacity: 0.3;
        }

        .empty-itinerary {
          text-align: center;
          padding: var(--space-2xl) var(--space-xl);
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          border: 1px dashed rgba(212, 165, 116, 0.3);
        }

        .empty-compass {
          margin-bottom: var(--space-lg);
          animation: float 4s ease-in-out infinite;
        }

        .empty-text {
          font-size: 1rem;
          color: var(--slate);
          font-style: italic;
        }

        .ticket-footer {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-top: var(--space-xl);
          padding: var(--space-lg) 0;
        }

        .footer-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.3;
        }

        .footer-text {
          font-size: 0.75rem;
          color: var(--slate);
          letter-spacing: 2px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
