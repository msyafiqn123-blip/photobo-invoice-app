import React, { useRef, useState, useEffect } from 'react';

export const formatWithThousandSeparator = (val, allowNegative = true) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val).trim();
  const isNegative = allowNegative && str.startsWith('-');
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return isNegative ? '-' : '';
  const formatted = Number(digits).toLocaleString('id-ID');
  return isNegative ? `-${formatted}` : formatted;
};

const FormattedNumberInput = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  allowNegative = true,
  ...props
}) => {
  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(() =>
    formatWithThousandSeparator(value, allowNegative)
  );

  // Sync when prop value changes externally
  useEffect(() => {
    setDisplayValue(formatWithThousandSeparator(value, allowNegative));
  }, [value, allowNegative]);

  const handleChange = (e) => {
    const input = e.target;
    const raw = input.value;
    const cursor = input.selectionEnd || 0;
    const offsetFromRight = raw.length - cursor;

    // Handle single minus sign
    if (raw.trim() === '-' && allowNegative) {
      setDisplayValue('-');
      onChange(0);
      return;
    }

    // Handle empty
    if (!raw.trim()) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const isNegative = allowNegative && raw.trim().startsWith('-');
    const digits = raw.replace(/[^0-9]/g, '');

    if (!digits) {
      setDisplayValue(isNegative ? '-' : '');
      onChange(0);
      return;
    }

    const num = parseInt(digits, 10);
    const numericValue = isNegative ? -num : num;
    const formatted = formatWithThousandSeparator(numericValue, allowNegative);

    setDisplayValue(formatted);
    onChange(numericValue);

    // Maintain natural cursor position after separator adjustment
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newPos = Math.max(0, formatted.length - offsetFromRight);
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const handleBlur = () => {
    if (displayValue === '-' || !displayValue) {
      setDisplayValue('0');
      onChange(0);
    } else {
      setDisplayValue(formatWithThousandSeparator(value, allowNegative));
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default FormattedNumberInput;
