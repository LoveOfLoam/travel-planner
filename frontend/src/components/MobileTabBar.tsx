import { useEffect, useState } from 'react'

interface MobileTabBarProps {
  activeTab: 'chat' | 'itinerary'
  onTabChange: (tab: 'chat' | 'itinerary') => void
  hasNewTrip: boolean
}

export function MobileTabBar({ activeTab, onTabChange, hasNewTrip }: MobileTabBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className={`mobile-tab-bar ${mounted ? 'mobile-tab-bar--mounted' : ''}`}>
      <button
        className={`mobile-tab ${activeTab === 'chat' ? 'mobile-tab--active' : ''}`}
        onClick={() => onTabChange('chat')}
        aria-label="聊天"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="mobile-tab__label">聊天</span>
      </button>

      <button
        className={`mobile-tab ${activeTab === 'itinerary' ? 'mobile-tab--active' : ''}`}
        onClick={() => onTabChange('itinerary')}
        aria-label="行程"
      >
        <div className="mobile-tab__icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {hasNewTrip && <span className="mobile-tab__badge" />}
        </div>
        <span className="mobile-tab__label">行程</span>
      </button>

      <style>{`
        .mobile-tab-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(56px + var(--safe-area-bottom, 0px));
          padding-bottom: var(--safe-area-bottom, 0px);
          background: white;
          border-top: 1px solid rgba(212, 165, 116, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 50;
          box-shadow: 0 -2px 10px rgba(45, 55, 72, 0.05);
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .mobile-tab-bar--mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 24px;
          min-width: 64px;
          min-height: 48px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--slate);
          transition: color 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-tab--active {
          color: var(--terracotta);
        }

        .mobile-tab__label {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .mobile-tab__icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-tab__badge {
          position: absolute;
          top: -4px;
          right: -8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @media (min-width: 1025px) {
          .mobile-tab-bar {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}
