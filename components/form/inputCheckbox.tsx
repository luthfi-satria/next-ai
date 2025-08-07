import React from "react"
import { LabelInput } from "./inputLabel"

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: React.ChangeEvent<Element>) => void
  name?: string
  value?: string
  id?: string
  className?: string
}

const CheckboxInput: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  name,
  id,
  value,
  className,
}) => {
  const checkboxId = id || label.toLowerCase().replace(/\s/g, "-")
  return (
    <div className="mb-4 flex items-center">
      <input
        id={checkboxId}
        name={name || checkboxId}
        type="checkbox"
        checked={checked}
        value={value}
        onChange={(e) => onChange(e)}
        className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${className}`}
      />
      <LabelInput id={checkboxId} label={label} />
    </div>
  )
}

export default CheckboxInput
