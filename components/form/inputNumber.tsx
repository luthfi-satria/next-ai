import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React, { useState, useEffect } from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface NumberInputProps extends InputGeneratorType {
  value: string | number
  locale?: string
  allowDecimal?: boolean
  min?: number
  max?: number
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  id,
  className,
  locale = "id-ID",
  allowDecimal = true,
  min,
  max,
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-")
  
  // Convert value to number if it's a string
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
  
  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === 0) return ""
    
    // Use Intl.NumberFormat for locale-aware formatting
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: allowDecimal ? 0 : 0,
      maximumFractionDigits: allowDecimal ? 2 : 0,
    })
    
    return formatter.format(num)
  }
  
  const [displayValue, setDisplayValue] = useState<string>(
    numericValue !== 0 ? formatNumber(numericValue) : ""
  )
  const [isFocused, setIsFocused] = useState<boolean>(false)

  // Update display value when prop value changes (only if not focused)
  useEffect(() => {
    if (!isFocused) {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
      setDisplayValue(numValue !== 0 ? formatNumber(numValue) : "")
    }
  }, [value, locale, allowDecimal, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters, optionally allow decimal point
    const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g
    let rawValue = e.target.value.replace(regex, "")
    
    // Handle multiple decimal points - keep only the first one
    if (allowDecimal) {
      const parts = rawValue.split(".")
      rawValue = parts.length > 2 
        ? parts[0] + "." + parts.slice(1).join("")
        : rawValue
    }
    
    // While focused, show raw value for easier typing
    setDisplayValue(rawValue)
    
    // Convert to number for onChange callback
    const numValue = parseFloat(rawValue) || 0
    
    // Apply min/max constraints if provided
    let constrainedValue = numValue
    if (min !== undefined && numValue < min) {
      constrainedValue = min
      setDisplayValue(constrainedValue.toString())
    }
    if (max !== undefined && numValue > max) {
      constrainedValue = max
      setDisplayValue(constrainedValue.toString())
    }
    
    // Call onChange with the raw numeric value
    onChange?.({
      name: e.target.name,
      value: constrainedValue,
    })
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Show raw numeric value when focused for easier editing
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
    setDisplayValue(numValue !== 0 ? numValue.toString() : "")
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    // Format with thousand separators when blurred
    const rawValue = e.target.value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "")
    const numValue = parseFloat(rawValue) || 0
    
    // Apply min/max constraints
    let constrainedValue = numValue
    if (min !== undefined && numValue < min) {
      constrainedValue = min
    }
    if (max !== undefined && numValue > max) {
      constrainedValue = max
    }
    
    const formatted = constrainedValue !== 0 ? formatNumber(constrainedValue) : ""
    setDisplayValue(formatted)
  }

  return (
    <div className="flex flex-col w-full">
      <LabelInput id={inputId} label={label} />
      <input
        type="text"
        name={name || inputId}
        id={inputId}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "0"}
        autoComplete="false"
        className={`${FORM_BASE_CLASSNAME} ${className || ""}`}
      />
    </div>
  )
}

export default NumberInput


