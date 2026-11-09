import React from 'react';
import { COLORS } from '../lib/constants';

const baseInput = {
  width: '100%', boxSizing: 'border-box',
  backgroundColor: COLORS.surface2, borderRadius: 10,
  border: `1.5px solid ${COLORS.border}`,
  padding: '10px 12px', fontSize: 14, color: COLORS.textPrimary,
  outline: 'none', fontFamily: 'inherit',
};
const baseLabel = {
  fontSize: 12, fontWeight: 800, color: COLORS.textSecondary,
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
