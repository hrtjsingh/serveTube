import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const ActionIcon = action?.icon

  return (
    <div className="st-empty">
      <div className="rounded-2xl bg-muted/40 p-5">
        <Icon size={36} className="text-muted-foreground/40" />
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-xs text-sm leading-relaxed">{description}</p>
      {action && (
        <Button variant="brand" onClick={action.onClick} className="mt-1">
          {ActionIcon && <ActionIcon size={14} />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
