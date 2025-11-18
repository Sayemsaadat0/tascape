// import { cn } from '../../../lib/utils';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React from 'react';

// Define the props type for TextInput component using 'type'
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: any;
  className?: string;
};

// Variants using class-variance-authority
const inputVariants = cva(
  'w-full px-3 py-2 border border-gray-300  outline-none peer h-11 rounded-full',
);

const TextInput: React.FC<TextInputProps> = ({
  label,
  className,
  type = 'text', 
  id,
  error,
  placeholder,
  ...props
}) => {
  return (
    <div>
      <div className="relative">
        <input
          autoComplete="off"
          type={type}
          id={id}
          className={cn(
            inputVariants({ className }),
            type === 'number' && '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]'
          )}
          placeholder={placeholder || ''}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="absolute text-sm duration-300 transform px-3 -translate-y-3 scale-75 z-10 peer-focus:bg-white rounded origin-[0] peer-focus:px-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-orange-400 px-2 pt-2">{error}</p>}
    </div>
  );
};

export default TextInput;
