import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';

const SelectTrigger = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ children, className = '', value, ...props }, ref) => {
  return (
    <option
      ref={ref}
      value={value}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </option>
  );
});

SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef(({ placeholder, className = '', ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={`text-gray-500 ${className}`}
      {...props}
    >
      {placeholder}
    </span>
  );
});

SelectValue.displayName = 'SelectValue';

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};
