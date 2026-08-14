import React, { forwardRef } from "react";

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  delay?: number;
}

const DebouncedInput = React.memo(forwardRef<HTMLInputElement, DebouncedInputProps>(({
  value,
  onChange,
  delay,
  ...props
}, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}));

export default DebouncedInput;
