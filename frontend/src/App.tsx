import { useState, useEffect, useCallback } from 'react'
import { ChatPanel } from './components/Chat/ChatPanel'
import { ResultPanel } from './components/ResultPanel/ResultPanel'
import { MobileTabBar } from './components/MobileTabBar'
import { useTripStore } from './stores/tripStore'
import './styles/global.css'

function App() {
  const { currentResult } = useTripStore()
  const [activeTab, setActiveTab] = useState<'chat' | 'itinerary'>('chat')
  const [hasNewResult, setHasNewResult] = useState(false)

  useEffect(() => {
    if (currentResult) {
      setHasNewResult(true)
    }
  }, [currentResult])

  const handleTabChange = useCallback((tab: 'chat' | 'itinerary') => {
    setActiveTab(tab)
    if (tab === 'itinerary') {
      setHasNewResult(false)
    }
  }, [])

  return (
    <div className="app-container">
      {/* 左侧对话面板 */}
      <aside className={`chat-sidebar ${activeTab === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
        <ChatPanel />
      </aside>

      {/* 右侧结果展示 */}
      <main className={`result-main paper-texture ${activeTab === 'itinerary' ? 'mobile-visible' : 'mobile-hidden'}`}>
        <ResultPanel />
      </main>

      {/* 移动端底部标签栏 */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasNewTrip={hasNewResult}
      />

      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--cream);
        }

        .chat-sidebar {
          width: 480px;
          min-width: 480px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: white;
          border-right: 1px solid rgba(212, 165, 116, 0.2);
          box-shadow: 4px 0 20px rgba(45, 55, 72, 0.05);
          position: relative;
          z-index: 10;
        }

        .result-main {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-xl);
          position: relative;
        }

        @media (max-width: 1024px) {
          .chat-sidebar {
            width: 100%;
            min-width: 100%;
          }

          .chat-sidebar.mobile-hidden,
          .result-main.mobile-hidden {
            display: none;
          }

          .chat-sidebar.mobile-visible,
          .result-main.mobile-visible {
            display: flex;
            flex-direction: column;
          }

          .result-main {
            padding-bottom: calc(72px + var(--safe-area-bottom, 0px));
          }
        }
      `}</style>
    </div>
  )
}

export default App
