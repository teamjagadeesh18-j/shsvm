import React, { useRef } from 'react';
import { sanitizePhoneDigits } from './formValidation.js';
import './FormInputs.css';

/**
 * PhoneInput Component
 * Fixed +91 prefix, strict digits-only filtering, tel keypad hint, 10-digit validation.
 */
export default function PhoneInput({
  id,
  name,
  value = '',
  onChange,
  onBlur,
  error,
  label,
  required = false,
  disabled = false,
  placeholder = '98765 43210',
  className = '',
  autoComplete = 'tel-national'
}) {
  const inputRef = useRef(null);

  // Keydown guard to intercept non-digits before input occurs
  const handleKeyDown = (e) => {
    // Allow navigation and edit controls
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
    // Block exceeding 10 digits if no text is selected
    const input = e.target;
    const isSelection = input.selectionStart !== input.selectionEnd;
    if (input.value.length >= 10 && !isSelection) {
      e.preventDefault();
    }
  };

  // Modern input guard
  const handleBeforeInput = (e) => {
    if (e.data && !/^[0-9]+$/.test(e.data)) {
      e.preventDefault();
    }
  };

  // Clean pasted text and insert at cursor
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text');
    const cleanedPaste = sanitizePhoneDigits(pasteText);
    if (!cleanedPaste) return;

    const input = inputRef.current || e.target;
    const currentVal = input.value || '';
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const nextVal = (currentVal.slice(0, start) + cleanedPaste + currentVal.slice(end)).slice(0, 10);
    const sanitizedFinal = sanitizePhoneDigits(nextVal);

    if (onChange) {
      onChange({ target: { name, value: sanitizedFinal } });
    }
  };

  // Change handler to clean any autofill or composition
  const handleChange = (e) => {
    const raw = e.target.value;
    const sanitized = sanitizePhoneDigits(raw);
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
          <span className="form-input-hint">(10 digits)</span>
        </div>
      )}

      <div className={`phone-input-wrapper ${error ? 'has-error' : ''}`}>
        {/* Fixed visual prefix */}
        <span className="phone-prefix-badge" aria-hidden="true">
          +91
        </span>

        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onBlur={onBlur}
          maxLength={10}
          inputMode="tel"
          pattern="[0-9]*"
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="phone-native-input"
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

