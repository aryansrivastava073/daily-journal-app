import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  widthClassName?: string
}

export function Modal({ isOpen, onClose, title, children, widthClassName }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div
        className={`w-full ${widthClassName ?? 'max-w-md'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="max-h-[85vh] overflow-y-auto rounded-2xl bg-cream p-6 shadow-xl dark:bg-dusk-surface-dark">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink dark:text-inherit">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-ink-soft hover:bg-sage/60"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
