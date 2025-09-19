import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface TextAreaInputProps extends InputGeneratorType {
  value: string
  rows?: number
  className?: string
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  name,
  id,
  className,
}) => {
  const textareaId = id || label.toLowerCase().replace(/\s/g, "-")
  return (
    <div className="flex flex-col">
      <LabelInput id={textareaId} label={label} />
      <textarea
        name={name || textareaId}
        id={textareaId}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e)}
        placeholder={placeholder}
        className={`${FORM_BASE_CLASSNAME}  ${className}`}
      ></textarea>
    </div>
  )
}

export default TextAreaInput
