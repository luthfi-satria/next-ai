import { FORM_SELECT_CLASSNAME } from '@/constants/formStyleConstant'
import React from 'react'
import { LabelInput } from './inputLabel'

interface SelectOption {
    label: string
    value: string
}

interface SelectInputProps {
    label: string
    options: SelectOption[]
    selectedValue: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    name?: string
    className?: string
    id?: string
}

const SelectInput: React.FC<SelectInputProps> = ({ label, options, selectedValue, onChange, name, id, className }) => {
    const selectId = id || label.toLowerCase().replace(/\s/g, '-')
    return (
        <div className="mb-4">
            <LabelInput id={selectId} label={label} />
            <div className='relative'>
                <select
                    id={selectId}
                    name={name || selectId}
                    value={selectedValue}
                    onChange={(e) => onChange(e)}
                    className={className || FORM_SELECT_CLASSNAME}
                >
                    <option value="">-- Select {label.toLowerCase()} --</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-gray-700 dark:text-gray-400 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            </div>
        </div>
    )
}

export default SelectInput