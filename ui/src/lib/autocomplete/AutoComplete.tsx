import {
  AutocompleteProps,
  Autocomplete as BaseSelect,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import { FormControl, styled } from '@mui/material';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Iconbutton } from '../iconButton';

export interface ItemProps {
  value: string;
  label: string;
  group?: string;
}

export interface IBaseSelect
  extends Omit<
    AutocompleteProps<ItemProps, boolean, boolean, boolean>,
    'renderInput' | 'onChange' | 'value'
  > {
  options: ItemProps[];
  label: string;
  value: ItemProps | ItemProps[] | null;
  multiple?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  onChange: (
    event: SyntheticEvent,
    value: ItemProps | ItemProps[] | null,
  ) => void;
  filterOptions?: (options: ItemProps[], state: unknown) => ItemProps[];
  searchDisable?: boolean;
  onOpen?: () => void;
  loading?: boolean;
}

const StyledSelect = styled(FormControl)<{
  size: 'small' | 'medium' | 'large';
}>(({ size }) => ({
  '& .MuiFormLabel-root': {
    fontSize: size === 'small' ? 12 : 14,
    top: size === 'small' ? '-4px' : '-2px',
    '&.MuiInputLabel-shrink': {
      top: 0,
    },
  },
  '& .MuiInputBase-root': {
    fontSize: size === 'small' ? 12 : 14,
    padding: size === 'small' ? '4px !important' : '6px !important',
  },
  '& .MuiSelect-select': {
    padding: size === 'small' ? 10 : 14,
  },
}));
const StyledChip = styled(Chip)<{ size: 'small' | 'medium' | 'large' }>(
  ({ theme, size }) => ({
    '&.MuiChip-root': {
      background: theme.palette.primary.main,
      color: theme.palette.common.white,
      ...theme.typography.body1,
      textTransform: 'capitalize',
      padding: size === 'small' ? 4 : 6,
      '& button': {
        color: theme.palette.common.white,
        paddingLeft: 0,
        '&:hover': {
          color: '#fff',
        },
      },
    },
  }),
);

const StyledPaper = styled(Paper)(({ theme }) => ({
  '&.MuiAutocomplete-paper': {
    ...theme.typography.subtitle2,
  },
}));

const StyledTooltip = styled(Tooltip)(({ theme }) => ({}));

const AutoComplete: React.FC<IBaseSelect> = ({
  options,
  label,
  multiple = false,
  disabled = false,
  error = false,
  helperText = '',
  value,
  fullWidth = false,
  size = 'medium',
  required = false,
  onChange,
  filterOptions,
  searchDisable = false,
  onOpen,
  loading,
}) => {
  const [selectedValues, setSelectedValues] = useState<
    ItemProps | ItemProps[] | null
  >(value);
  
  const [displayedTags, setDisplayedTags] = useState<ItemProps[]>([]);
  const [remainingTags, setRemainingTags] = useState<ItemProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  useEffect(() => {
    if (containerRef.current && inputRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const inputWidth = inputRef.current.offsetWidth;
      const availableWidth = containerWidth - inputWidth - 40;

      let totalWidth = 0;
      const displayed: ItemProps[] = [];
      const remaining: ItemProps[] = [];

      (selectedValues as ItemProps[]).forEach((tag) => {
        const chip = document.createElement('div');
        chip.style.visibility = 'hidden';
        chip.style.position = 'absolute';
        chip.style.whiteSpace = 'nowrap';
        chip.textContent = tag.label;
        document.body.appendChild(chip);
        const chipWidth = chip.offsetWidth + 8; // 8px for padding
        document.body.removeChild(chip);

        if (totalWidth + chipWidth <= availableWidth) {
          totalWidth += chipWidth;
          displayed.push(tag);
        } else {
          remaining.push(tag);
        }
      });

      setDisplayedTags(displayed);
      setRemainingTags(remaining);
    }
  }, [selectedValues, containerRef.current, inputRef.current]);

  const handleChange = (
    event: SyntheticEvent,
    newValue: ItemProps | ItemProps[] | null,
  ) => {
    setSelectedValues(newValue);
    onChange(event, newValue);
  };

  const handleDelete = (deletedValue: string) => {
    console.log(deletedValue, 'deletedValue');

    if (!Array.isArray(selectedValues)) return;

    const newValues = selectedValues.filter(
      (item) => item.value !== deletedValue,
    );
    setSelectedValues(newValues);

    const syntheticEvent = {
      target: { value: newValues },
      currentTarget: { value: newValues },
      preventDefault: () => {
        // Synthetic event method
      },
      stopPropagation: () => {
        // Synthetic event method
      },
      nativeEvent: {} as Event,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      persist: () => {
        // Synthetic event method
      },
    } as unknown as SyntheticEvent<Element, Event>;

    onChange(syntheticEvent, newValues);
  };

  const renderTags = (tagValue: ItemProps[], getTagProps: any) => {
    const displayedTags = tagValue.slice(0, 2);
    const remainingTags = tagValue.slice(2);

    return (
      <>
        {displayedTags.map((option: ItemProps, index: number) => (
          <StyledChip
            key={index}
            size={size}
            deleteIcon={<Iconbutton name="close" />}
            label={option?.label}
            {...getTagProps({ index })}
            onDelete={() => handleDelete(option.value)}
            sx={{ marginRight: 8 }}
          />
        ))}
        {remainingTags.length > 0 && (
          <StyledTooltip
            title={remainingTags.map((option) => option?.label).join(', ')}
          >
            <StyledChip
              size={size}
              label={`+${remainingTags.length} more`}
              sx={{ marginRight: 8 }}
            />
          </StyledTooltip>
        )}
      </>
    );
  };

  return (
    <StyledSelect
      fullWidth={fullWidth}
      disabled={disabled}
      error={error}
      required={required}
      size={size}
      sx={{ width: fullWidth ? '100%' : 240 }}
    >
      <BaseSelect
        multiple={multiple}
        options={options}
        popupIcon={
          <>
            {loading ? <CircularProgress size={20} /> : <Iconbutton name="down-arrow" />}
          </>
        }
        filterOptions={filterOptions}
        groupBy={(option) => option.group || ''}
        getOptionLabel={(option: ItemProps) =>
          option.label ? option.label : String(option.value)
        }
        isOptionEqualToValue={(option: ItemProps, value: ItemProps) =>
          option.value === value?.value
        }
        slots={{ paper: StyledPaper }}
        disableCloseOnSelect={multiple ? true : false}
        value={selectedValues}
        onChange={handleChange}
        disabled={disabled}
        clearIcon={<Iconbutton name="close" />}
        renderTags={multiple ? renderTags : undefined}
        onOpen={onOpen}
        loading={loading}
        loadingText="Loading..."
        renderInput={(params) => {
          const {
            ref,
            ...restInputProps
          } =  params.inputProps;
          return (
            <TextField
              {...params}
              label={label}
              variant="outlined"
              error={error}
              required={!selectedValues && required}
              helperText={helperText}
              size={size === 'small' ? 'small' : 'medium'}
              slotProps={{
                htmlInput: {
                  ...restInputProps,
                  ref: ref,
                  readOnly: searchDisable,
                },
              }}
            />
          );
        }}
      />
    </StyledSelect>
  );
};

AutoComplete.displayName = 'AutoComplete';

export default AutoComplete;
