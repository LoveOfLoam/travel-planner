import type { WeatherInfo } from '../../types'

interface Props {
  weather: WeatherInfo
}

export function WeatherCard({ weather }: Props) {
  return (
    <div className="weather-card">
      <div className="card-header">
        <div className="header-gradient" />
        <div className="stamp">
          <span className="stamp-text">天</span>
        </div>
        <h2 className="card-title">天气预报</h2>
        {weather.destination && (
          <span className="destination">{weather.destination}</span>
        )}
      </div>

      <div className="card-body">
        {weather.forecast.length > 0 ? (
          <>
            {/* 当日天气 */}
            <div className="today-weather">
              <div className="today-main">
                <span className="weather-icon-large">
                  <WeatherIcon weather={weather.forecast[0].weather} size={48} />
                </span>
                <div className="today-info">
                  <span className="temperature">{weather.forecast[0].temperature}</span>
                  <span className="weather-desc">{weather.forecast[0].weather}</span>
                </div>
              </div>
              {weather.forecast[0].suggestion && (
                <p className="suggestion">{weather.forecast[0].suggestion}</p>
              )}
            </div>

            {/* 未来预报 */}
            {weather.forecast.length > 1 && (
              <div className="forecast-list">
                {weather.forecast.slice(1).map((day) => (
                  <div key={day.day} className="forecast-item">
                    <span className="forecast-day">{day.date || `第 ${day.day} 天`}</span>
                    <WeatherIcon weather={day.weather} size={24} />
                    <span className="forecast-temp">{day.temperature}</span>
                    <span className="forecast-weather">{day.weather}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="no-data">暂无天气数据</p>
        )}
      </div>

      <style>{`
        .weather-card {
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
          background: linear-gradient(90deg, var(--terracotta), var(--gold));
        }

        .stamp {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--terracotta);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .stamp-text {
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1.8rem;
          color: var(--terracotta);
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
          background: rgba(198, 123, 92, 0.08);
          border-radius: var(--radius-md);
        }

        .card-body {
          padding: 0 var(--space-xl) var(--space-xl);
        }

        .today-weather {
          background: linear-gradient(135deg, rgba(198, 123, 92, 0.06), rgba(212, 165, 116, 0.06));
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin-bottom: var(--space-lg);
        }

        .today-main {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-md);
        }

        .today-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .temperature {
          font-size: 2rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        .weather-desc {
          font-size: 1rem;
          color: var(--slate);
        }

        .suggestion {
          font-size: 0.9rem;
          color: var(--slate);
          line-height: 1.6;
          margin: 0;
          padding-top: var(--space-md);
          border-top: 1px solid rgba(212, 165, 116, 0.15);
        }

        .forecast-list {
          display: flex;
          gap: var(--space-md);
          overflow-x: auto;
          padding-bottom: var(--space-sm);
          scrollbar-width: thin;
        }

        .forecast-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: white;
          border: 1px solid rgba(212, 165, 116, 0.15);
          border-radius: var(--radius-lg);
          min-width: 100px;
          flex-shrink: 0;
        }

        .forecast-day {
          font-size: 0.75rem;
          color: var(--slate);
          font-weight: 500;
        }

        .forecast-temp {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--charcoal);
        }

        .forecast-weather {
          font-size: 0.8rem;
          color: var(--slate);
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

function WeatherIcon({ weather, size = 24 }: { weather: string; size?: number }) {
  const w = weather.toLowerCase()
  let icon: React.ReactNode

  if (w.includes('雨') || w.includes('rain')) {
    icon = (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <path d="M8 17l0.5 2" /><path d="M12 17l0.5 2" /><path d="M16 17l0.5 2" />
      </svg>
    )
  } else if (w.includes('雪') || w.includes('snow')) {
    icon = (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--ocean-blue)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <path d="M8 17l1 1" /><path d="M12 17l1 1" /><path d="M16 17l1 1" />
      </svg>
    )
  } else if (w.includes('云') || w.includes('阴') || w.includes('cloud') || w.includes('overcast')) {
    icon = (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--slate)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 10h-1.26A8 8 0 1 0 4 16.25" />
        <path d="M18 10a5 5 0 0 0-2 9.58" />
      </svg>
    )
  } else if (w.includes('风') || w.includes('wind')) {
    icon = (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2" /><path d="M12.59 19.41A2 2 0 1 0 14 16H2" /><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    )
  } else {
    // 默认晴天
    icon = (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }

  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
}
