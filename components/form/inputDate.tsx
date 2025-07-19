import { FORM_BASE_CLASSNAME } from '@/constants/formStyleConstant'
import React from 'react'
import { LabelInput } from './inputLabel'

interface DateInputProps {
    label: string
    value: string // Format YYYY-MM-DD
    onChange: (value: string) => void
    name?: string
    className?: string
    id?: string
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, name, id, className }) => {
    const dateId = id || label.toLowerCase().replace(/\s/g, '-')
    return (
        <div className="mb-4">
            <LabelInput id={dateId} label={label} />
            <input
                type="date"
                name={name || dateId}
                id={dateId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={className || FORM_BASE_CLASSNAME}
            />
        </div>
    )
}

export default DateInput