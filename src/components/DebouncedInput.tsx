import React, { useState, useEffect, useRef, forwardRef } from "react";

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  delay?: number;
}

const DebouncedInput = React.memo(forwardRef<HTMLInputElement, DebouncedInputProps>(({
  value,
  onChange,
  delay = 250,
  ...props
}, ref) => {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (value !== localValue) {
       setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
         onChangeRef.current(localValue);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [localValue, delay, value]);

  return (
    <input
      {...props}
      ref={ref}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
}));

export default DebouncedInput;
