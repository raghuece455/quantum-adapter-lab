import { type ReactNode } from 'react'

type Variant = 'classical' | 'quantum' | 'paper' | 'neutral' | 'success' | 'danger'

interface Props {
  variant?: Variant
  children: ReactNode
  className?: string
}

const styles: Record<Variant, string> = {
  classical: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  quantum: 'bg-purple-900/50 text-amber-300 border border-purple-600/50',
  paper: 'bg-amber-900/40 text-amber-300 border border-amber-600/50',
  neutral: 'bg-gray-800 text-gray-300 border border-gray-700',
  success: 'bg-green-900/40 text-green-300 border border-green-700/50',
  danger: 'bg-red-900/40 text-red-300 border border-red-700/50',
}

export default function Badge({ variant = 'neutral', children, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
