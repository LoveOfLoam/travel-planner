import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { AgentProgress } from './AgentProgress'

export function ChatPanel() {
  const [input, setInput] = useState('')
  const { messages, isLoading, send } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const message = input.trim()
    setInput('')
    await send(message)
  }

  const quickPrompts = [
    '帮我规划北京3天游',
    '上海美食之旅',
    '云南7天深度游',
    '西安历史文化游',
  ]

  return (
    <div className="chat-panel">
      {/* 头部 */}
      <header className="chat-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <rect x="4" y="8" width="32" height="24" rx="3" fill="none" stroke="var(--terracotta)" strokeWidth="2"/>
                <path d="M4 14 L20 22 L36 14" fill="none" stroke="var(--terracotta)" strokeWidth="2"/>
                <circle cx="20" cy="18" r="3" fill="var(--sage)"/>
                <path d="M14 28 L20 24 L26 28" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <div>
              <h1 className="header-title">旅途手记</h1>
              <p className="header-subtitle">AI 旅行规划助手</p>
            </div>
          </div>
          <div className="header-decoration">
            <div className="stamp-mark">旅</div>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-section">
            <div className="welcome-card">
              <p className="welcome-text">
                你好，我是你的旅行规划助手。
                <br/>
                告诉我你想去哪里，我会为你规划一段难忘的旅程。
              </p>
              <div className="quick-prompts">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="quick-prompt-btn"
                    onClick={() => {
                      setInput(prompt)
                      inputRef.current?.focus()
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="messages-list">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}
        </div>

        <AgentProgress />
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你的旅行需求..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? (
              <span className="loading-dots">
                <span>·</span><span>·</span><span>·</span>
              </span>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
              </svg>
            )}
          </button>
        </div>
        <p className="input-hint">按 Enter 发送消息</p>
      </form>

      <style>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(180deg, #FAFAF8 0%, #F8F6F2 100%);
        }

        .chat-header {
          padding: var(--space-lg) var(--space-xl);
          background: white;
          border-bottom: 1px solid rgba(212, 165, 116, 0.15);
          position: relative;
        }

        .chat-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: var(--space-xl);
          right: var(--space-xl);
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.4;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(198, 123, 92, 0.06);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(198, 123, 92, 0.15);
        }

        .header-title {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.5rem;
          color: var(--charcoal);
          letter-spacing: 4px;
          margin-bottom: 2px;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--slate);
          letter-spacing: 2px;
        }

        .header-decoration {
          position: relative;
        }

        .stamp-mark {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.2rem;
          color: var(--terracotta);
          border: 2px solid var(--terracotta);
          border-radius: 50%;
          opacity: 0.4;
          transform: rotate(-15deg);
          animation: stamp 0.8s ease-out;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
          scroll-behavior: smooth;
        }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: var(--space-xl);
        }

        .welcome-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(212, 165, 116, 0.15);
          max-width: 360px;
          animation: scaleIn 0.6s ease-out;
          position: relative;
        }

        .welcome-card::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 4px;
          background: var(--terracotta);
          border-radius: 2px;
          opacity: 0.6;
        }

        .welcome-text {
          font-size: 0.95rem;
          color: var(--slate);
          line-height: 1.8;
          margin-bottom: var(--space-lg);
          text-align: center;
        }

        .quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          justify-content: center;
        }

        .quick-prompt-btn {
          padding: var(--space-sm) var(--space-md);
          background: rgba(139, 157, 119, 0.08);
          border: 1px solid rgba(139, 157, 119, 0.2);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--sage);
          transition: all 0.3s ease;
        }

        .quick-prompt-btn:hover {
          background: rgba(139, 157, 119, 0.15);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .input-form {
          padding: var(--space-lg) var(--space-xl);
          background: white;
          border-top: 1px solid rgba(212, 165, 116, 0.15);
          position: relative;
        }

        .input-form::before {
          content: '';
          position: absolute;
          top: -1px;
          left: var(--space-xl);
          right: var(--space-xl);
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.4;
        }

        .input-wrapper {
          display: flex;
          gap: var(--space-md);
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: var(--space-md) var(--space-lg);
          background: var(--parchment);
          border: 1px solid rgba(212, 165, 116, 0.2);
          border-radius: var(--radius-lg);
          font-size: 0.95rem;
          color: var(--charcoal);
          transition: all 0.3s ease;
        }

        .message-input::placeholder {
          color: var(--slate);
          opacity: 0.5;
        }

        .message-input:focus {
          border-color: var(--terracotta);
          box-shadow: 0 0 0 3px rgba(198, 123, 92, 0.1);
        }

        .message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--terracotta);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .send-button:hover:not(:disabled) {
          background: var(--rust);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--slate);
        }

        .loading-dots {
          display: flex;
          gap: 2px;
          font-size: 1.2rem;
        }

        .loading-dots span {
          animation: pulse 1.4s infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .input-hint {
          margin-top: var(--space-sm);
          font-size: 0.7rem;
          color: var(--slate);
          opacity: 0.5;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
