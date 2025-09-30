// src/components/ui/Select.tsx
import React from 'react';

type SelectProps = React.ComponentPropsWithoutRef<'select'> & {
    options: { value: string; label: string }[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ options, ...props }, ref) => (
    <select
        ref={ref}
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
    >
        {options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
));