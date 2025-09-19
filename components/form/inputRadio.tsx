import React from "react"
import { InputGeneratorType } from "./inputGenerator"
import { RadioOption } from "@/models/interfaces/global.interfaces"

interface RadioInputProps extends InputGeneratorType {
  selectedValue: string
  options: RadioOption[]
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
        {options &&
          options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${groupName}-${option.value}`}
                name={groupName}
                type="radio"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={(e) => onChange(e)}
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
