import { type ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'quantum'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 border border-transparent',
  quantum: 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ variant = 'secondary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
