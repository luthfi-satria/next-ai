import { FORM_BASE_CLASSNAME } from '@/constants/formStyleConstant'
import React from 'react'
import { LabelInput } from './inputLabel'

interface TextInputProps {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type?: React.HTMLInputTypeAttribute // 'text', 'password', 'email', 'number', etc.
    name?: string
    id?: string
    className?: string
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, type = 'text', name, id, className }) => {
    const inputId = id || label.toLowerCase().replace(/\s/g, '-')
    return (
        <div className="mb-4">
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