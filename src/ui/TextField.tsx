import { useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  invalid?: boolean;
}

export function TextField({ label, invalid, id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={fieldId} className="field__label">
        {label}
      </label>
      <input
        id={fieldId}
        className="field__input"
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </div>
  );
}
