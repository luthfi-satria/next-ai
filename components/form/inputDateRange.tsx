import { FORM_LABEL } from "@/constants/formStyleConstant"
import React, { ChangeEvent } from "react"
import DateInput from "./inputDate"
import { LabelInput } from "./inputLabel"

interface DateRangeInputProps {
  label: string
  startDate: string // Format YYYY-MM-DD
  endDate: string // Format YYYY-MM-DD
  onStartDateChange: (value: ChangeEvent<Element>) => void
  onEndDateChange: (value: ChangeEvent<Element>) => void
  startName?: string
  endName?: string
  idPrefix?: string
  className?: string
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
  const prefix = idPrefix || label.toLowerCase().replace(/\s/g, "-")
  const startDateId = `${prefix}-start-date`
  const endDateId = `${prefix}-end-date`

  return (
    <div className="mb-4">
      <LabelInput
        id={idPrefix}
        label={label}
        className={className || FORM_LABEL}
      />
      <div className="flex space-x-4">
        <div className="flex-1">
          <LabelInput
            id={startDateId}
            label="Start Date"
            className={className || FORM_LABEL}
          />
          <DateInput
            label="Start Date"
            onChange={(e) => onStartDateChange(e)}
            value={startDate}
            id={startDateId}
            name={startName || `${prefix}-start`}
          />
        </div>
        <div className="flex items-center text-gray-500">to</div>
        <div className="flex-1">
          <LabelInput
            id={endDateId}
            label="End Date"
            className={className || FORM_LABEL}
          />
          <DateInput
            label="End Date"
            onChange={(e) => onEndDateChange(e)}
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
