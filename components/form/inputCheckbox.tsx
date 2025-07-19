import React from 'react';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    name?: string;
    id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, name, id }) => {
    const checkboxId = id || label.toLowerCase().replace(/\s/g, '-');
    return (
        <div className="mb-4 flex items-center">
            <input
                id={checkboxId}
                name={name || checkboxId}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor={checkboxId} className="ml-3 block text-sm font-medium text-gray-700">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;