import React from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface CheckboxProps extends InputGeneratorType {
  value?: string
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
    <div className="flex flex-row">
      <input
        id={checkboxId}
        name={name || checkboxId}
        type="checkbox"
        checked={checked}
        value={value}
        onChange={(e) => onChange(e)}
        className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${className}`}
      />
      <LabelInput id={checkboxId} label={label} className="grow-1" />
    </div>
  )
}

export default CheckboxInput
