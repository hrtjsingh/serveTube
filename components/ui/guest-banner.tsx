import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GuestBannerProps {
  message?: string
  actionLabel?: string
  onAction: () => void
}

export function GuestBanner({
  message = 'Local playlists only. Sign in to sync.',
  actionLabel = 'Sign in',
  onAction,
}: GuestBannerProps) {
  return (
    <div className="st-guest-banner">
      <div className="flex items-center gap-2 text-sm text-blue-300">
        <Lock size={14} className="shrink-0" />
        <span>{message}</span>
      </div>
      <Button variant="info" size="sm" onClick={onAction} className="shrink-0">
        {actionLabel}
      </Button>
    </div>
  )
}
