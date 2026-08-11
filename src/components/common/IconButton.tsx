import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
}

export function IconButton({ children, active, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        'text-ink-soft hover:bg-sage hover:text-ink',
        active && 'bg-sage text-sage-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
