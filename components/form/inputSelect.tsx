import { FORM_SELECT_CLASSNAME } from "@/constants/formStyleConstant"
import React from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface SelectOption {
  label: string
  value: string
}

interface SelectInputProps extends InputGeneratorType {
  options: SelectOption[]
  selectedValue: string
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  name,
  id,
  className,
}) => {
  const selectId = id || label.toLowerCase().replace(/\s/g, "-")
  return (
    <div className="flex flex-col">
      <LabelInput id={selectId} label={label} />
      <div className="relative">
        <select
          id={selectId}
          name={name || selectId}
          value={selectedValue}
          onChange={(e) => onChange(e)}
          className={`${FORM_SELECT_CLASSNAME}  ${className}`}
        >
          <option value="">-- Select {label.toLowerCase()} --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SelectInput
