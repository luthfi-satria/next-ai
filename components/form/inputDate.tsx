import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface DateInputProps extends InputGeneratorType {
  className?: string
  value?: string
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  name,
  id,
  className,
}) => {
  const dateId = id || label.toLowerCase().replace(/\s/g, "-")
  return (
    <div className="flex flex-col">
      <LabelInput id={dateId} label={label} />
      <input
        type="date"
        name={name || dateId}
        id={dateId}
        value={value}
        onChange={(e) => onChange(e)}
        className={`${FORM_BASE_CLASSNAME}  ${className}`}
      />
    </div>
  )
}

export default DateInput
