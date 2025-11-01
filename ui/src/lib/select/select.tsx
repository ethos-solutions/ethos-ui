import {
  InputLabel,
  MenuItem,
  Select as BaseSelect,
  FormControl,
  Chip,
  OutlinedInput,
  styled,
  FormHelperText,
  BaseSelectProps,
} from '@mui/material';
import { FC } from 'react';
import { Close } from '@mui/icons-material';

interface ItemProps {
  value: string;
  label: string;
}

export interface CustomSelectProps extends BaseSelectProps {
  items: ItemProps[];
  value: string[] | string;
  id?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  handleDelete?: (item: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  defaultValue?: string;
}

const StyledSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiFormLabel-root': {
    fontSize: 14,
    top: '-2px',
    '&.MuiInputLabel-shrink': {
      top: 0,
    },
  },
  '& .MuiInputBase-root': {
    fontSize: 14,
  },
  '& .MuiSelect-select': {
    padding: 14,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  '&.MuiChip-root': {
    color: theme.palette.primary.dark,
    background: theme.palette.primary.light,
    fontSize: 12,
    borderRadius: 5,
    marginInlineEnd: 12,
    '&:last-child': {
      marginInlineEnd: 0,
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  '&.MuiMenuItem-root': {
    fontSize: 14,
  },
}));

const Select: FC<CustomSelectProps> = ({
  fullWidth = true,
  items,
  onChange,
  value,
  id = 'menu',
  disabled,
  label,
  size,
  multiple,
  handleDelete,
  error,
  helperText,
  required,
  defaultValue,
  ...props
}) => {
  const renderValue = multiple
    ? (selected: any) => (
        <div>
          {(selected as string[]).map((value) =>
            value ? (
              <StyledChip
                key={value}
                label={
                  items.find((item) => item.value === value)?.label || value
                }
                onDelete={() => handleDelete?.(value)}
                deleteIcon={
                  <Close onMouseDown={(event) => event.stopPropagation()} />
                }
              />
            ) : null
          )}
        </div>
      )
    : undefined;

  return (
    <StyledSelect
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      error={error}
      required={required}
    >
      <InputLabel id={`select-${id}`}>{label}</InputLabel>
      <BaseSelect
        defaultValue={defaultValue}
        fullWidth={fullWidth}
        labelId={`select-${id}`}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        input={<OutlinedInput label={label} />}
        multiple={multiple}
        renderValue={multiple ? renderValue : undefined}
        {...props}
      >
        {items.map((val: ItemProps) => (
          <StyledMenuItem key={val.value} value={val.value}>
            {val.label}
          </StyledMenuItem>
        ))}
      </BaseSelect>
      <FormHelperText>{helperText}</FormHelperText>
    </StyledSelect>
  );
};

Select.displayName = 'Select';
export default Select;
