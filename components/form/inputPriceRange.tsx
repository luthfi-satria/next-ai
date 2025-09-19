import { FORM_BASE_CLASSNAME } from "@/constants/formStyleConstant"
import React, { useEffect, useState } from "react"
import TextInput from "./inputText"
import { formatCurrency } from "@/helpers/currency"
import { InputGeneratorType } from "./inputGenerator"

interface PriceRangeInputProps extends InputGeneratorType {
  options: { [key: string]: string }
  idPrefix?: string
}

const PriceRangeInput: React.FC<PriceRangeInputProps> = ({
  label,
  options,
  onChange,
  name,
  idPrefix,
  className,
}) => {
  const prefix = idPrefix || label.toLowerCase().replace(/\s/g, "-")
  const minPriceId = `${prefix}-min-price`
  const maxPriceId = `${prefix}-max-price`
  const minName = `min_${name || "price"}`
  const maxName = `max_${name || "price"}`

  const [priceValue, setPriceValue] = useState<{ [key: string]: string }>(
    options,
  )
  useEffect(() => {
    setPriceValue(options)
  }, [options])

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "")
    const formattedValue = formatCurrency(Number(rawValue)).toString()
    setPriceValue({
      ...priceValue,
      [e.target.name]: formattedValue,
    })

    onChange({ name: e.target.name, value: rawValue })
  }

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4">
        <div className="flex-1">
          <TextInput
            id={minPriceId}
            name={minName}
            label={`${label} min`}
            onChange={onPriceChange}
            placeholder={`${formatCurrency(1000)}`}
            value={priceValue?.[minName] ?? ""}
            className={className || FORM_BASE_CLASSNAME}
          />
        </div>
        <div className="flex-1">
          <TextInput
            id={maxPriceId}
            name={maxName}
            label={`${label} max`}
            onChange={onPriceChange}
            placeholder={`${formatCurrency(1000000)}`}
            value={priceValue?.[maxName] ?? ""}
            className={className || FORM_BASE_CLASSNAME}
          />
        </div>
      </div>
    </div>
  )
}

export default PriceRangeInput
