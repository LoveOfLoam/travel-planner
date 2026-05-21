interface Props {
  iconId: string
  size?: number
}

export function AgentIcon({ iconId, size = 16 }: Props) {
  switch (iconId) {
    case 'map':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2l-6 2v18l6-2 6 2 6-2V2l-6 2-6-2z" />
          <path d="M9 2v18" /><path d="M15 4v18" />
          <path d="M3 8h6" strokeDasharray="2 2" opacity="0.5" />
          <path d="M15 10h6" strokeDasharray="2 2" opacity="0.5" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
          <path d="M6 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
      )
    case 'train':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="14" rx="2" />
          <path d="M4 10h16" />
          <circle cx="8" cy="20" r="1.5" /><circle cx="16" cy="20" r="1.5" />
          <path d="M8 17v3" /><path d="M16 17v3" />
          <path d="M9 6h6" />
        </svg>
      )
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" /><path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" /><circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
      )
  }
}
