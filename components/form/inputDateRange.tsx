import { FORM_LABEL } from "@/constants/formStyleConstant"
import React, { ChangeEvent } from "react"
import DateInput from "./inputDate"
import { LabelInput } from "./inputLabel"
import { InputGeneratorType } from "./inputGenerator"

interface DateRangeInputProps extends InputGeneratorType {
  startDate: string // Format YYYY-MM-DD
  endDate: string // Format YYYY-MM-DD
  onStartDateChange: (value: ChangeEvent<Element>) => void
  onEndDateChange: (value: ChangeEvent<Element>) => void
  startName?: string
  endName?: string
  idPrefix?: string
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startName,
  endName,
  idPrefix,
  className,
}) => {
  const defaultLabel = label ? label.toLowerCase().replace(/\s/g, "-") : ""
  const prefix = idPrefix || defaultLabel
  const startDateId = `${prefix}-start-date`
  const endDateId = `${prefix}-end-date`

  return (
    <div className="flex flex-col">
      {label && (
        <LabelInput
          id={idPrefix}
          label={label}
          className={className || FORM_LABEL}
        />
      )}
      <div className="flex space-x-4">
        <div className="flex-1">
          <DateInput
            label="Start Date"
            onChange={onStartDateChange}
            value={startDate}
            id={startDateId}
            name={startName || `${prefix}-start`}
          />
        </div>
        <div className="flex items-center text-gray-500">to</div>
        <div className="flex-1">
          <DateInput
            label="End Date"
            onChange={onEndDateChange}
            value={endDate}
            id={endDateId}
            name={endName || `${prefix}-end`}
          />
        </div>
      </div>
    </div>
  )
}

export default DateRangeInput
