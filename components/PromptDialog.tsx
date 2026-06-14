'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PromptDialogProps {
  open: boolean
  title: string
  label?: string
  placeholder?: string
  defaultValue?: string
  submitText?: string
  cancelText?: string
  loading?: boolean
  onSubmit: (value: string) => void
  onCancel: () => void
}

export function PromptDialog({
  open,
  title,
  label = 'Name',
  placeholder = '',
  defaultValue = '',
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
      setError('')
    }
  }, [open, defaultValue])

  if (!open) return null

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('This field is required')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <div
      className="st-modal-overlay"
      onClick={e => e.target === e.currentTarget && !loading && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-dialog-title"
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

        <h2 id="prompt-dialog-title" className="pr-8 text-lg font-bold">
          {title}
        </h2>

        <div className="mt-4">
          <label className="st-label">{label}</label>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={e => {
              setValue(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="brand" onClick={submit} disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  )
}
