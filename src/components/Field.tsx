import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  error?: string;
  /** Bila diisi, field dirender sebagai textarea. */
  rows?: number;
}

export default function Field({ id, label, error, rows, ...rest }: FieldProps) {
  const shared = {
    id,
    className: 'field',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  };
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {rows ? (
        <textarea {...shared} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} rows={rows} />
      ) : (
        <input {...shared} {...rest} />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
