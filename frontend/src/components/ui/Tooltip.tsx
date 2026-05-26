import { useState, type ReactNode } from 'react'

interface Props {
  content: string
  children: ReactNode
}

export default function Tooltip({ content, children }: Props) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-gray-700 text-xs text-gray-100 whitespace-nowrap z-50 shadow-lg border border-gray-600">
          {content}
        </span>
      )}
    </span>
  )
}
