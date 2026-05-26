interface Props {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  showValue?: boolean
  formatValue?: (v: number) => string
}

export default function Slider({ label, min, max, step = 1, value, onChange, showValue = true, formatValue }: Props) {
  const display = formatValue ? formatValue(value) : String(value)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-400">{label}</label>
        {showValue && <span className="text-sm font-mono text-purple-300">{display}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  )
}
