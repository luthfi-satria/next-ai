import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface TextInputProps extends InputGeneratorType {
  value: string
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  name,
  id,
  className,
}) => {
  const inputId = id || label.toLowerCase().replace(/\s/g, "-")
  return (
    <div className="flex flex-col">
      <LabelInput id={inputId} label={label} />
      <input
        type={type}
        name={name || inputId}
        id={inputId}
        value={value}
        onChange={(e) => onChange(e)}
        placeholder={placeholder}
        className={`${FORM_BASE_CLASSNAME}  ${className}`}
      />
    </div>
  )
}

export default TextInput
