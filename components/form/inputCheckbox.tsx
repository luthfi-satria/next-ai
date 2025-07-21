import React from 'react'

interface CheckboxProps {
    label: string
    checked: boolean
    onChange: (checked: React.ChangeEvent<Element>) => void
    name?: string
    value?: string
    id?: string
}

const CheckboxInput: React.FC<CheckboxProps> = ({ label, checked, onChange, name, id, value }) => {
    const checkboxId = id || label.toLowerCase().replace(/\s/g, '-')
    return (
        <div className="mb-4 flex items-center">
            <input
                id={checkboxId}
                name={name || checkboxId}
                type="checkbox"
                checked={checked}
                value={value}
                onChange={(e) => onChange(e)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor={checkboxId} className="ml-3 block text-sm font-medium text-gray-700">
                {label}
            </label>
        </div>
    )
}

export default CheckboxInput