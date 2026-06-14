'use client'

import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="st-modal-overlay"
      onClick={e => e.target === e.currentTarget && !loading && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="st-modal-panel">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <h2 id="confirm-dialog-title" className="pr-8 text-lg font-bold">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'brand'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
