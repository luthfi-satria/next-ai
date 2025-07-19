import React from 'react';

interface DateRangeInputProps {
    label: string;
    startDate: string; // Format YYYY-MM-DD
    endDate: string;   // Format YYYY-MM-DD
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    startName?: string;
    endName?: string;
    idPrefix?: string;
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
}) => {
    const prefix = idPrefix || label.toLowerCase().replace(/\s/g, '-');
    const startDateId = `${prefix}-start-date`;
    const endDateId = `${prefix}-end-date`;

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor={startDateId} className="sr-only">Start Date</label>
                    <input
                        type="date"
                        name={startName || `${prefix}-start`}
                        id={startDateId}
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-center text-gray-500">to</div>
                <div className="flex-1">
                    <label htmlFor={endDateId} className="sr-only">End Date</label>
                    <input
                        type="date"
                        name={endName || `${prefix}-end`}
                        id={endDateId}
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default DateRangeInput;