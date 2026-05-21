import type { BudgetInfo } from '../../types'

interface Props {
  budget: BudgetInfo
}

const BAR_COLORS = ['var(--terracotta)', 'var(--ocean-blue)', 'var(--gold)', 'var(--sage)']

export function BudgetCard({ budget }: Props) {
  return (
    <div className="budget-card">
      <div className="card-header">
        <div className="header-gradient" />
        <div className="stamp">
          <span className="stamp-text">财</span>
        </div>
        <h2 className="card-title">预算分析</h2>
        <span className="total-budget">¥{budget.total_budget.toLocaleString()}</span>
      </div>

      <div className="card-body">
        {/* 堆叠条形图 */}
        {budget.breakdown.length > 0 && (
          <div className="stacked-bar">
            {budget.breakdown.map((item, i) => (
              <div
                key={i}
                className="bar-segment"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }}
                title={`${item.category}: ¥${item.amount} (${item.percentage}%)`}
              />
            ))}
          </div>
        )}

        {/* 明细列表 */}
        {budget.breakdown.length > 0 && (
          <div className="breakdown-list">
            {budget.breakdown.map((item, i) => (
              <div key={i} className="breakdown-item">
                <div className="item-header">
                  <span
                    className="item-dot"
                    style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                  />
                  <span className="item-category">{item.category}</span>
                  <span className="item-amount">¥{item.amount.toLocaleString()}</span>
                  <span className="item-pct">{item.percentage}%</span>
                </div>
                <div className="item-bar-bg">
                  <div
                    className="item-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 省钱贴士 */}
        {budget.tips && budget.tips.length > 0 && (
          <div className="tips-section">
            <h3 className="tips-title">省钱贴士</h3>
            <ul className="tips-list">
              {budget.tips.map((tip, i) => (
                <li key={i} className="tip-item">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .budget-card {
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
          background: linear-gradient(90deg, var(--gold), var(--sage));
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

        .total-budget {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--terracotta);
        }

        .card-body {
          padding: 0 var(--space-xl) var(--space-xl);
        }

        .stacked-bar {
          display: flex;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: var(--space-xl);
          background: rgba(212, 165, 116, 0.1);
        }

        .bar-segment {
          transition: width 0.6s ease-out;
          min-width: 4px;
        }

        .bar-segment:first-child {
          border-radius: 6px 0 0 6px;
        }

        .bar-segment:last-child {
          border-radius: 0 6px 6px 0;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .item-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .item-category {
          font-size: 0.9rem;
          color: var(--charcoal);
          flex: 1;
        }

        .item-amount {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .item-pct {
          font-size: 0.8rem;
          color: var(--slate);
          min-width: 36px;
          text-align: right;
        }

        .item-bar-bg {
          height: 6px;
          background: rgba(212, 165, 116, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .item-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease-out;
        }

        .tips-section {
          padding: var(--space-lg);
          background: linear-gradient(135deg, rgba(139, 157, 119, 0.06), rgba(212, 165, 116, 0.06));
          border-radius: var(--radius-lg);
        }

        .tips-title {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.1rem;
          color: var(--sage);
          margin: 0 0 var(--space-md);
          letter-spacing: 2px;
        }

        .tips-list {
          margin: 0;
          padding-left: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .tip-item {
          font-size: 0.85rem;
          color: var(--charcoal);
          line-height: 1.6;
        }

        .tip-item::marker {
          color: var(--sage);
        }
      `}</style>
    </div>
  )
}
