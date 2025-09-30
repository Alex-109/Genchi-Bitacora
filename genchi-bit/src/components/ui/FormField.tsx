// src/components/ui/FormField.tsx
import React from 'react';

interface FormFieldProps {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
    className?: string;
}

export const FormField = ({ label, htmlFor, children, className = '' }: FormFieldProps) => (
    <div className={className}>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 mb-1">
            {label}
        </label>
        {children}
    </div>
);