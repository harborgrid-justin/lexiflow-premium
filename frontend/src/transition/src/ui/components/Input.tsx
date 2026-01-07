/**
 * Input - Text input component
 */

import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="input-wrapper">
      {label && <label className="input__label">{label}</label>}
      <input className="input" {...props} />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
}
