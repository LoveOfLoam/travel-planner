import type { TransportInfo } from '../../types'

interface Props {
  transport: TransportInfo
}

export function TransportCard({ transport }: Props) {
  return (
    <div className="transport-card">
      <div className="card-header">
        <div className="header-gradient" />
        <div className="stamp">
          <span className="stamp-text">行</span>
        </div>
        <h2 className="card-title">交通方案</h2>
        {transport.origin && transport.destination && (
          <span className="route">{transport.origin} → {transport.destination}</span>
        )}
      </div>

      <div className="card-body">
        {transport.options.length > 0 ? (
          <div className="options-list">
            {transport.options.map((opt, i) => (
              <div
                key={i}
                className={`option-card ${opt.recommended ? 'recommended' : ''}`}
              >
                <div className="option-icon">
                  <TransportIcon type={opt.type} />
                </div>
                <div className="option-info">
                  <div className="option-header">
                    <span className="option-type">{opt.type}</span>
                    {opt.recommended && <span className="recommend-badge">推荐</span>}
                  </div>
                  <div className="option-details">
                    {opt.duration && <span className="detail">{opt.duration}</span>}
                    {opt.cost && <span className="detail">{opt.cost}</span>}
                  </div>
                  {opt.description && (
                    <p className="option-desc">{opt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">暂无交通方案</p>
        )}
      </div>

      <style>{`
        .transport-card {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
        }

        .card-header {
          position: relative;
          padding: var(--space-xl);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .header-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--ocean-blue), var(--sage));
        }

        .stamp {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--ocean-blue);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .stamp-text {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.8rem;
          color: var(--ocean-blue);
          transform: rotate(-15deg);
          display: block;
        }

        .card-title {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.6rem;
          color: var(--charcoal);
          letter-spacing: 4px;
          flex: 1;
        }

        .route {
          font-size: 0.85rem;
          color: var(--slate);
          padding: var(--space-xs) var(--space-md);
          background: rgba(59, 130, 160, 0.08);
          border-radius: var(--radius-md);
        }

        .card-body {
          padding: 0 var(--space-xl) var(--space-xl);
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .option-card {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-lg);
          background: white;
          border: 1px solid rgba(212, 165, 116, 0.15);
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .option-card:hover {
          box-shadow: var(--shadow-sm);
        }

        .option-card.recommended {
          border-left: 4px solid var(--sage);
          background: linear-gradient(135deg, rgba(139, 157, 119, 0.04), transparent);
        }

        .option-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 160, 0.08);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .option-info {
          flex: 1;
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .option-type {
          font-size: 1rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .recommend-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: var(--sage);
          color: white;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .option-details {
          display: flex;
          gap: var(--space-lg);
          margin-bottom: var(--space-sm);
        }

        .detail {
          font-size: 0.85rem;
          color: var(--slate);
        }

        .option-desc {
          font-size: 0.85rem;
          color: var(--slate);
          margin: 0;
          line-height: 1.5;
        }

        .no-data {
          text-align: center;
          color: var(--slate);
          padding: var(--space-2xl);
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

function TransportIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t.includes('飞机') || t.includes('flight') || t.includes('飞')) {
    return (
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    )
  }
  if (t.includes('火车') || t.includes('高铁') || t.includes('train') || t.includes('动车')) {
    return (
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15.5V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10.5" />
        <path d="M4 15.5A2.5 2.5 0 0 0 6.5 18h11a2.5 2.5 0 0 0 2.5-2.5" />
        <circle cx="8.5" cy="18" r="2" /><circle cx="15.5" cy="18" r="2" />
        <path d="M8 4h8" /><path d="M4 11h16" />
      </svg>
    )
  }
  if (t.includes('自驾') || t.includes('驾车') || t.includes('driving') || t.includes('汽车')) {
    return (
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
        <circle cx="7.5" cy="17" r="2" /><circle cx="16.5" cy="17" r="2" />
      </svg>
    )
  }
  // 默认公交
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v2m8-2v2" /><rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" />
      <path d="M12 3v2" />
    </svg>
  )
}
