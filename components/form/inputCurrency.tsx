import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React, { useState, useEffect } from "react"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"
import { formatCurrency } from "@/helpers/currency"
import { Currency } from "@/models/interfaces/global.interfaces"

interface CurrencyInputProps extends InputGeneratorType {
  value: string | number
  locale?: string
  currency?: Currency
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  id,
  className,
  locale = "id-ID",
  currency = Currency.RUPIAH,
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-")
  const currencyType = currency
  
  // Convert value to number if it's a string
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
  
  // Format the display value - formatCurrency returns string or 0, so convert 0 to empty string
  const getFormattedValue = (num: number): string => {
    const formatted = formatCurrency(num, locale, currencyType)
    return typeof formatted === "string" ? formatted : ""
  }
  
  const [displayValue, setDisplayValue] = useState<string>(
    numericValue > 0 ? getFormattedValue(numericValue) : ""
  )
  const [isFocused, setIsFocused] = useState<boolean>(false)

  // Update display value when prop value changes (only if not focused)
  useEffect(() => {
    if (!isFocused) {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
      setDisplayValue(numValue > 0 ? getFormattedValue(numValue) : "")
    }
  }, [value, locale, currencyType, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters except decimal point
    const rawValue = e.target.value.replace(/[^0-9.]/g, "")
    
    // Handle multiple decimal points - keep only the first one
    const parts = rawValue.split(".")
    const sanitizedValue = parts.length > 2 
      ? parts[0] + "." + parts.slice(1).join("")
      : rawValue
    
    // While focused, show raw value for easier typing
    setDisplayValue(sanitizedValue)
    
    // Convert to number for onChange callback
    const numValue = parseFloat(sanitizedValue) || 0
    
    // Call onChange with the raw numeric value
    onChange?.({
      name: e.target.name,
      value: numValue,
    })
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Show raw numeric value when focused for easier editing
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value || 0
    setDisplayValue(numValue > 0 ? numValue.toString() : "")
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    // Format back to currency when blurred
    const rawValue = e.target.value.replace(/[^0-9.]/g, "")
    const numValue = parseFloat(rawValue) || 0
    const formatted = numValue > 0 ? getFormattedValue(numValue) : ""
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
        placeholder={placeholder || getFormattedValue(0) || "0"}
        autoComplete="false"
        className={`${FORM_BASE_CLASSNAME} ${className || ""}`}
      />
    </div>
  )
}

export default CurrencyInput

