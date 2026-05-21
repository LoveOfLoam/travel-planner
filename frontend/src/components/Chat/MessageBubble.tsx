import type { Message } from '../../types'

interface Props {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: Props) {
  const isUser = message.role === 'user'
  const delay = index * 0.1

  return (
    <div
      className={`message-bubble ${isUser ? 'user-message' : 'assistant-message'}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {!isUser && (
        <div className="avatar">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="rgba(139, 157, 119, 0.1)" stroke="var(--sage)" strokeWidth="1"/>
            <path d="M10 20 Q16 14 22 20" fill="none" stroke="var(--sage)" strokeWidth="1.5"/>
            <circle cx="12" cy="14" r="1.5" fill="var(--sage)"/>
            <circle cx="20" cy="14" r="1.5" fill="var(--sage)"/>
            <path d="M16 8 L16 12" stroke="var(--terracotta)" strokeWidth="1.5"/>
            <circle cx="16" cy="7" r="2" fill="var(--terracotta)" opacity="0.6"/>
          </svg>
        </div>
      )}

      <div className={`bubble-content ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {message.content}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="14" fill="rgba(198, 123, 92, 0.1)" stroke="var(--terracotta)" strokeWidth="1"/>
            <circle cx="16" cy="12" r="5" fill="var(--terracotta)" opacity="0.6"/>
            <path d="M8 24 Q16 18 24 24" fill="var(--terracotta)" opacity="0.4"/>
          </svg>
        </div>
      )}

      <style>{`
        .message-bubble {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          animation: fadeInUp 0.4s ease-out both;
        }

        .user-message {
          justify-content: flex-end;
        }

        .assistant-message {
          justify-content: flex-start;
        }

        .avatar {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .user-avatar {
          order: 1;
        }

        .bubble-content {
          max-width: 75%;
          padding: var(--space-md) var(--space-lg);
          line-height: 1.7;
          font-size: 0.95rem;
          white-space: pre-wrap;
          word-break: break-word;
          position: relative;
        }

        .user-bubble {
          background: linear-gradient(135deg, var(--terracotta) 0%, var(--rust) 100%);
          color: white;
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
          box-shadow: 0 4px 12px rgba(198, 123, 92, 0.25);
        }

        .user-bubble::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%);
          pointer-events: none;
        }

        .assistant-bubble {
          background: white;
          color: var(--charcoal);
          border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(212, 165, 116, 0.1);
        }

        .assistant-bubble::before {
          content: '';
          position: absolute;
          top: 12px;
          left: -6px;
          width: 12px;
          height: 12px;
          background: white;
          border-left: 1px solid rgba(212, 165, 116, 0.1);
          border-bottom: 1px solid rgba(212, 165, 116, 0.1);
          transform: rotate(45deg);
        }

        .user-bubble::after {
          content: '';
          position: absolute;
          top: 12px;
          right: -6px;
          width: 12px;
          height: 12px;
          background: var(--terracotta);
          transform: rotate(45deg);
        }
      `}</style>
    </div>
  )
}
