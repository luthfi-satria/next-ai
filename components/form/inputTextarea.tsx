import React from 'react';

interface TextAreaInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    name?: string;
    id?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, value, onChange, placeholder, rows = 3, name, id }) => {
    const textareaId = id || label.toLowerCase().replace(/\s/g, '-');
    return (
        <div className="mb-4">
            <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <textarea
                name={name || textareaId}
                id={textareaId}
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
        </div>
    );
};

export default TextAreaInput;