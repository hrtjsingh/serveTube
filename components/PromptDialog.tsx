'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'

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
      className="fixed inset-0 z-[350] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && !loading && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-dialog-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <h2 id="prompt-dialog-title" className="text-lg font-bold pr-8">
          {title}
        </h2>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </label>
          <input
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground"
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
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#f8bf59] px-4 py-2.5 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}
