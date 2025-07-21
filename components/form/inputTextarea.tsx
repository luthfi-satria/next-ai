import { FORM_BASE_CLASSNAME } from '@/constants/formStyleConstant';
import React from 'react';
import { LabelInput } from './inputLabel';

interface TextAreaInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    name?: string;
    id?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, value, onChange, placeholder, rows = 3, name, id }) => {
    const textareaId = id || label.toLowerCase().replace(/\s/g, '-');
    return (
        <div className="mb-4">
            <LabelInput id={textareaId} label={label} />
            <textarea
                name={name || textareaId}
                id={textareaId}
                rows={rows}
                value={value}
                onChange={(e) => onChange(e)}
                placeholder={placeholder}
                className={FORM_BASE_CLASSNAME}
            ></textarea>
        </div>
    );
};

export default TextAreaInput;