import React from "react"

interface RadioOption {
  label: string
  value: string
}

interface RadioInputProps {
  label: string
  name: string // Group name for radio buttons
  options: RadioOption[]
  selectedValue: string
  onChange: (value: string) => void
}

const RadioInput: React.FC<RadioInputProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
}) => {
  const groupName = name || label.toLowerCase().replace(/\s/g, "-")
  return (
    <fieldset className="flex flex-col">
      <legend className="text-base font-medium text-gray-900">{label}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${groupName}-${option.value}`}
              name={groupName}
              type="radio"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label
              htmlFor={`${groupName}-${option.value}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default RadioInput
