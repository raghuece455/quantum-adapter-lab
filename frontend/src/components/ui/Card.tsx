import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  quantumBorder?: boolean
  goldenBorder?: boolean
}

export default function Card({ children, className = '', quantumBorder, goldenBorder }: Props) {
  const border = quantumBorder
    ? 'border border-purple-500/50 shadow-purple-900/20 shadow-lg'
    : goldenBorder
    ? 'border border-amber-500/50 shadow-amber-900/20 shadow-lg'
    : 'border border-gray-800'

  return (
    <div className={`bg-gray-900 rounded-xl p-5 ${border} ${className}`}>
      {children}
    </div>
  )
}
