import React, { useRef } from 'react';
import { sanitizeNumericDigits } from './formValidation.js';
import './FormInputs.css';

/**
 * NumericInput Component
 * Strict digits-only input with numeric keypad hint, custom length, and validation.
 */
export default function NumericInput({
  id,
  name,
  value = '',
  onChange,
  onBlur,
  error,
  label,
  hint,
  required = false,
  disabled = false,
  placeholder = '',
  maxLength,
  disallowLeadingZero = false,
  className = '',
  autoComplete = 'off'
}) {
  const inputRef = useRef(null);

  const clean = (val) => sanitizeNumericDigits(val, { maxLength, disallowLeadingZero });

  const handleKeyDown = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter',
      'Home', 'End', 'Escape'
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    // Block non-digits
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // Block leading zero if disallowLeadingZero
    if (disallowLeadingZero && e.key === '0' && (!e.target.value || e.target.selectionStart === 0)) {
      e.preventDefault();
      return;
    }
    // Block exceeding maxLength
    const isSelection = e.target.selectionStart !== e.target.selectionEnd;
    if (typeof maxLength === 'number' && e.target.value.length >= maxLength && !isSelection) {
      e.preventDefault();
    }
  };

  const handleBeforeInput = (e) => {
    if (e.data && !/^[0-9]+$/.test(e.data)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text');
    const cleanedPaste = clean(pasteText);
    if (!cleanedPaste) return;

    const input = inputRef.current || e.target;
    const currentVal = input.value || '';
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const nextVal = currentVal.slice(0, start) + cleanedPaste + currentVal.slice(end);
    const sanitizedFinal = clean(nextVal);

    if (onChange) {
      onChange({ target: { name, value: sanitizedFinal } });
    }
  };

  const handleChange = (e) => {
    const sanitized = clean(e.target.value);
    if (onChange) {
      onChange({ target: { name, value: sanitized } });
    }
  };

  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`form-input-container ${className}`}>
      {label && (
        <div className="form-input-label-row">
          <label htmlFor={id} className="form-input-label">
            <span>{label}</span>
            {required && <span className="req">*</span>}
          </label>
          {hint && <span className="form-input-hint">{hint}</span>}
        </div>
      )}

      <div className={`numeric-input-wrapper ${error ? 'has-error' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onBlur={onBlur}
          maxLength={maxLength}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="numeric-native-input"
          aria-invalid={!!error}
          aria-describedby={errorId}
        />
      </div>

      {error && (
        <div id={errorId} className="form-input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

