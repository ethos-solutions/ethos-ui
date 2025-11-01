import { ReactNode, useState } from 'react';
import {
  Controller,
  FieldErrors,
  FieldValue,
  FieldValues,
  Path,
  get,
} from 'react-hook-form';
import { TextField } from '../../lib/textfield';

interface ControlledInputProps<T extends FieldValues> {
  name: Path<T>;
  control: any;
  type: string;
  required?: boolean;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  placeholder?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: FieldErrors<T>;
  errors?: FieldErrors<T>;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: FieldValue<T>) => void;
}

export const ControlledInput = <T extends FieldValues>({
  name,
  control,
  type,
  required,
  label,
  rightIcon,
  leftIcon,
  fullWidth,
  multiline,
  rows,
  helperText: _helperText,
  errors,
  disabled = false,
  readOnly,
  onChange,
  ...props
}: ControlledInputProps<T>) => {
  const [shrink, setShrink] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const currentError = errors ? get(errors, name) : undefined;
        return (
          <TextField
            type={type}
            label={label}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            required={required}
            fullWidth={fullWidth}
            multiline={multiline}
            disabled={disabled}
            rows={rows}
            helperText={currentError?.message}
            error={!!currentError}
            readOnly={readOnly}
            inputProps={{
              onFocus: () => setShrink(true),
              onBlur: () => setShrink(false),
            }}
            InputLabelProps={{
              shrink: field.value === 0 || field.value || shrink ? true : false,
            }}
            {...field}
            onChange={(e) => {
              let value;
              if (type === 'number') {
                value = e.target.value === '' ? '' : Number(e.target.value);
              } else {
                value = e.target.value;
              }
              field.onChange(value as FieldValue<T>);
              if (onChange) {
                onChange(value as FieldValue<T>);
              }
            }}
            {...props}
          />
        );
      }}
    />
  );
};
