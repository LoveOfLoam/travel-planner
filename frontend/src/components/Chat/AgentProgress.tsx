import { useAgentStore } from '../../stores/agentStore'
import { AgentIcon } from './AgentIcon'

export function AgentProgress() {
  const { isRunning, phase, overallProgress, parsedIntent, agents, events, intentType } = useAgentStore()

  if (intentType === 'general') return null
  if (!isRunning && events.length === 0) return null

  const latestMessage = events.length > 0
    ? (events[events.length - 1].data?.message as string) || ''
    : ''

  return (
    <div className="agent-progress">
      {/* 总进度条 */}
      <div className="progress-header">
        <div className="progress-icon">
          {phase === 'complete' ? (
            <div className="complete-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--sage)" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          ) : (
            <div className="compass-spinner">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="31.4 31.4" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <path d="M12 6 L14 12 L12 14 L10 12 Z" fill="var(--terracotta)">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
          )}
        </div>
        <div className="progress-info">
          <span className="progress-label">
            {phase === 'thinking' && '正在分析需求...'}
            {phase === 'dispatching' && '正在派遣智能体...'}
            {phase === 'running' && '智能体协作规划中...'}
            {phase === 'aggregating' && '正在汇总结果...'}
            {phase === 'complete' && '规划完成！'}
          </span>
          <span className="progress-percent">{overallProgress}%</span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
      </div>

      {/* 需求分析结果 */}
      {parsedIntent && (
        <div className="intent-badges">
          {parsedIntent.destination && (
            <span className="badge badge-dest">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 1C5.2 1 3 3.2 3 6c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z"/>
                <circle cx="8" cy="6" r="1.5"/>
              </svg>
              {parsedIntent.destination}
            </span>
          )}
          {parsedIntent.origin && (
            <span className="badge badge-origin">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 14V4l6-3 6 3v10"/>
                <path d="M6 14V8h4v6"/>
              </svg>
              {parsedIntent.origin}
            </span>
          )}
          {parsedIntent.days && (
            <span className="badge badge-days">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="3" width="12" height="11" rx="1.5"/>
                <path d="M2 7h12"/><path d="M5 1v4"/><path d="M11 1v4"/>
              </svg>
              {parsedIntent.days}天
            </span>
          )}
          {parsedIntent.budget && (
            <span className="badge badge-budget">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6"/><path d="M8 4v8"/><path d="M6 6.5h3.5a1 1 0 0 1 0 3H6"/>
              </svg>
              ¥{parsedIntent.budget.toLocaleString()}
            </span>
          )}
          {parsedIntent.people && (
            <span className="badge badge-people">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6" cy="4" r="2.5"/><path d="M1 14c0-3 2.5-5 5-5s5 2 5 5"/>
                <circle cx="11" cy="5" r="2"/><path d="M15 14c0-2.5-2-4-4-4"/>
              </svg>
              {parsedIntent.people}人
            </span>
          )}
          {parsedIntent.must_visit && parsedIntent.must_visit.length > 0 && (
            <span className="badge badge-must">
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.5 3.5 14.7l.9-5L.8 6.2l5-.7z"/>
              </svg>
              必去: {parsedIntent.must_visit.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* 智能体网格 */}
      {agents.length > 0 && (phase === 'dispatching' || phase === 'running' || phase === 'aggregating' || phase === 'complete') && (
        <div className="agents-grid">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={`agent-card agent-${agent.status}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="agent-card-header">
                <span className="agent-icon">
                  <AgentIcon iconId={agent.iconId} size={16} />
                </span>
                <span className="agent-label">{agent.label}</span>
                <span className="agent-status-icon">
                  {agent.status === 'pending' && <span className="status-dot pending" />}
                  {agent.status === 'running' && (
                    <svg className="spin-icon" viewBox="0 0 16 16" width="14" height="14">
                      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--terracotta)" strokeWidth="2" strokeDasharray="18.8 18.8" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  )}
                  {agent.status === 'complete' && (
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--sage)" strokeWidth="2">
                      <path d="M13 5L6.5 11.5 3 8"/>
                    </svg>
                  )}
                  {agent.status === 'error' && (
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#e74c3c" strokeWidth="2">
                      <path d="M12 4L4 12M4 4l8 8"/>
                    </svg>
                  )}
                </span>
              </div>
              {agent.message && (
                <div className="agent-message">{agent.message}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 最新事件消息 */}
      {latestMessage && phase !== 'complete' && (
        <div className="latest-message">
          <span className="latest-dot" />
          {latestMessage}
        </div>
      )}

      <style>{`
        .agent-progress {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin: var(--space-md) 0;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(212, 165, 116, 0.15);
          animation: scaleIn 0.4s ease-out;
        }

        .progress-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-sm);
        }

        .progress-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compass-spinner {
          animation: pulse 2s ease-in-out infinite;
        }

        .complete-icon {
          animation: scaleIn 0.4s ease-out;
        }

        .progress-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .progress-percent {
          font-size: 0.8rem;
          color: var(--terracotta);
          font-weight: 600;
          font-family: 'Georgia', serif;
        }

        .progress-track {
          height: 4px;
          background: rgba(212, 165, 116, 0.15);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: var(--space-md);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sage), var(--terracotta));
          border-radius: 2px;
          transition: width 0.5s ease-out;
        }

        /* 需求分析 badges */
        .intent-badges {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          margin-bottom: var(--space-md);
          animation: fadeIn 0.4s ease-out;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          animation: scaleIn 0.3s ease-out;
        }

        .badge-dest {
          background: rgba(198, 123, 92, 0.12);
          color: var(--terracotta);
        }

        .badge-origin {
          background: rgba(139, 157, 119, 0.12);
          color: var(--sage);
        }

        .badge-days {
          background: rgba(59, 130, 160, 0.1);
          color: var(--ocean-blue);
        }

        .badge-budget {
          background: rgba(212, 165, 116, 0.15);
          color: #8B6914;
        }

        .badge-people {
          background: rgba(139, 157, 119, 0.1);
          color: var(--sage);
        }

        .badge-must {
          background: rgba(231, 76, 60, 0.08);
          color: #c0392b;
        }

        /* 智能体网格 */
        .agents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
          animation: fadeIn 0.4s ease-out;
        }

        .agent-card {
          background: var(--parchment);
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-md);
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .agent-pending {
          opacity: 0.5;
        }

        .agent-running {
          border-color: rgba(198, 123, 92, 0.3);
          background: rgba(198, 123, 92, 0.05);
          animation: pulse 2s ease-in-out infinite;
        }

        .agent-complete {
          border-color: rgba(139, 157, 119, 0.3);
          background: rgba(139, 157, 119, 0.05);
        }

        .agent-error {
          border-color: rgba(231, 76, 60, 0.3);
          background: rgba(231, 76, 60, 0.05);
        }

        .agent-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .agent-icon {
          display: inline-flex;
          align-items: center;
          color: var(--terracotta);
        }

        .agent-label {
          flex: 1;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .agent-status-icon {
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--slate);
          opacity: 0.3;
        }

        .agent-message {
          font-size: 0.7rem;
          color: var(--slate);
          margin-top: 4px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* 最新消息 */
        .latest-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(139, 157, 119, 0.05);
          border-radius: var(--radius-md);
          font-size: 0.78rem;
          color: var(--slate);
          animation: fadeIn 0.3s ease-out;
        }

        .latest-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sage);
          flex-shrink: 0;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
