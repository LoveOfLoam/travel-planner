import type { POIItem } from '../../types'

interface Props {
  pois: POIItem[]
  destination?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  景点: 'var(--ocean-blue)',
  餐厅: 'var(--terracotta)',
  住宿: 'var(--gold)',
  购物: 'var(--sage)',
}

export function POICard({ pois, destination }: Props) {
  return (
    <div className="poi-card">
      <div className="card-header">
        <div className="header-gradient" />
        <div className="stamp">
          <span className="stamp-text">景</span>
        </div>
        <h2 className="card-title">景点推荐</h2>
        {destination && (
          <span className="destination">{destination}</span>
        )}
      </div>

      <div className="card-body">
        {pois.length > 0 ? (
          <div className="poi-list">
            {pois.map((poi, i) => (
              <div key={i} className="poi-item">
                <div className="poi-header">
                  <span className="poi-name">{poi.name}</span>
                  {poi.category && (
                    <span
                      className="poi-category"
                      style={{
                        color: CATEGORY_COLORS[poi.category] || 'var(--slate)',
                        borderColor: CATEGORY_COLORS[poi.category] || 'var(--slate)',
                      }}
                    >
                      {poi.category}
                    </span>
                  )}
                  {poi.rating !== undefined && (
                    <span className="poi-rating">
                      <svg viewBox="0 0 16 16" width={14} height={14} fill="var(--gold)">
                        <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.3L8 12.5 3.1 15l.9-5.3-4-3.9L5.5 5z" />
                      </svg>
                      {poi.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {poi.address && <p className="poi-address">{poi.address}</p>}
                {poi.description && <p className="poi-desc">{poi.description}</p>}
                {poi.tags && poi.tags.length > 0 && (
                  <div className="poi-tags">
                    {poi.tags.map((tag, j) => (
                      <span key={j} className="poi-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">暂无推荐景点</p>
        )}
      </div>

      <style>{`
        .poi-card {
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
          background: linear-gradient(90deg, var(--gold), var(--terracotta));
        }

        .stamp {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--gold);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .stamp-text {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.8rem;
          color: var(--gold);
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

        .destination {
          font-size: 0.85rem;
          color: var(--slate);
          padding: var(--space-xs) var(--space-md);
          background: rgba(212, 165, 116, 0.08);
          border-radius: var(--radius-md);
        }

        .card-body {
          padding: 0 var(--space-xl) var(--space-xl);
        }

        .poi-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .poi-item {
          padding: var(--space-lg);
          background: white;
          border: 1px solid rgba(212, 165, 116, 0.15);
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .poi-item:hover {
          box-shadow: var(--shadow-sm);
        }

        .poi-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          flex-wrap: wrap;
        }

        .poi-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .poi-category {
          font-size: 0.7rem;
          padding: 2px 8px;
          border: 1px solid;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .poi-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.8rem;
          color: var(--charcoal);
          font-weight: 600;
          margin-left: auto;
        }

        .poi-address {
          font-size: 0.8rem;
          color: var(--slate);
          margin: 0 0 var(--space-sm);
        }

        .poi-desc {
          font-size: 0.85rem;
          color: var(--charcoal);
          margin: 0 0 var(--space-sm);
          line-height: 1.5;
          opacity: 0.8;
        }

        .poi-tags {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .poi-tag {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: rgba(198, 123, 92, 0.08);
          border-radius: var(--radius-sm);
          color: var(--terracotta);
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
