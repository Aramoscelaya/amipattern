import React from 'react';

const baseInput = {
  width: '100%', boxSizing: 'border-box',
  backgroundColor: '#F9FAFB', borderRadius: 10,
  border: '1.5px solid #E5E7EB',
  padding: '10px 12px', fontSize: 14, color: '#1A1A2E',
  outline: 'none', fontFamily: 'inherit',
};
const baseLabel = {
  fontSize: 12, fontWeight: 800, color: '#6B7280',
  marginBottom: 4, display: 'block',
  textTransform: 'uppercase', letterSpacing: 0.5,
};

export function StyledInput({ value, onChange, placeholder, type, inputMode, min, max, autoFocus, style, ...rest }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      inputMode={inputMode}
      min={min}
      max={max}
      autoFocus={autoFocus}
      style={{ ...baseInput, ...style }}
      {...rest}
    />
  );
}

export function StyledLabel({ children, style }) {
  return <span style={{ ...baseLabel, ...style }}>{children}</span>;
}

export function StyledTextarea({ value, onChange, placeholder, rows, style, ...rest }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{ ...baseInput, resize: 'vertical', minHeight: 72, ...style }}
      {...rest}
    />
  );
}

export function SelectRow({ value, onChange, children, style, ...rest }) {
  return (
    <select value={value} onChange={onChange} style={{ ...baseInput, ...style }} {...rest}>
      {children}
    </select>
  );
}
