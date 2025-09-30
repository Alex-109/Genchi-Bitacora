// src/components/ui/Input.tsx
import React from 'react';

type InputProps = React.ComponentPropsWithoutRef<'input'>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
    <input
        ref={ref}
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
    />
));