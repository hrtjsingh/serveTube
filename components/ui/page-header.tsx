import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          {Icon && <Icon size={22} className="text-brand" />}
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
