import { useEffect, useMemo, useState } from 'react';
import {
  Dailog as Dialog,
  AutoComplete,
  Select,
  TextField,
} from '@ethos-frontend/ui';
import { useRestMutation, useRestQuery } from '@ethos-frontend/hook';
import { API_URL } from '@ethos-frontend/constants';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface Option {
  value: string;
  label: string;
}
type FormValues = yup.InferType<typeof schema>;
type CommissionType = 'Flat' | 'Percentage' | 'Both';
interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const money = yup
  .number()
  .transform((val, orig) => (orig === '' || orig === null ? undefined : val))
  .typeError('Must be a number')
  .min(0, 'Must be ≥ 0');

const schema = yup.object({
  orgIds: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required(),
        label: yup.string().required(),
      }),
    )
    .min(1, 'Organisation is required')
    .required(),
  commissionType: yup
    .string()
    .oneOf(['Flat', 'Percentage', 'Both'], 'Commission type is required')
    .required('Commission type is required'),

  commissionFlatValue: money.when('commissionType', {
    is: (t: CommissionType) => t === 'Flat' || t === 'Both',
    then: (s) => s.required('Flat value is required'),
    otherwise: (s) => s.optional(),
  }),
  commissionPercentValue: money.when('commissionType', {
    is: (t: CommissionType) => t === 'Percentage' || t === 'Both',
    then: (s) => s.required('Percent value is required'),
    otherwise: (s) => s.optional(),
  }),
});

export default function CommissionDialog({ open, onClose, onSaved }: Props) {
  const [orgOptions, setOrgOptions] = useState<Option[]>([]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      orgIds: [],
      commissionType: undefined as any,
      commissionFlatValue: undefined,
      commissionPercentValue: undefined,
    },
    mode: 'onChange',
  });

  const commissionType = useWatch({ control, name: 'commissionType' });

  const { data: orgData } = useRestQuery<any>(
    'active-orgs',
    API_URL.activeOrg,
    { enabled: open },
  );

  useEffect(() => {
    if (orgData?.data) {
      const opts = orgData.data.map((o: any) => ({
        value: o._id,
        label: o.orgName,
      }));
      setOrgOptions(opts);
    }
  }, [orgData]);

  const { mutate: saveCommission } = useRestMutation(API_URL.updateCommission, {
    method: 'PATCH',
  });

  const onSubmit = (data: FormValues) => {
    const orgIds = data.orgIds.map((o) => o.value);

    const payload: any = {
      orgIds,
      commissionType: data.commissionType,
    };

    if (data.commissionType === 'Flat' || data.commissionType === 'Both') {
      payload.commissionFlatValue = data.commissionFlatValue;
    }
    if (
      data.commissionType === 'Percentage' ||
      data.commissionType === 'Both'
    ) {
      payload.commissionPercentValue = data.commissionPercentValue;
    }

    saveCommission(payload, {
      onSuccess: () => {
        onClose();
        onSaved();
        reset();
      },
    });
  };

  const commissionTypeItems = useMemo(
    () => [
      { value: 'Flat', label: 'Flat' },
      { value: 'Percentage', label: 'Percentage' },
      { value: 'Both', label: 'Both (Flat + %)' },
    ],
    [],
  );

  const showFlat = commissionType === 'Flat' || commissionType === 'Both';
  const showPercent =
    commissionType === 'Percentage' || commissionType === 'Both';

  return (
    <Dialog
      open={open}
      onCancel={() => {
        onClose();
        reset();
      }}
      onConfirm={handleSubmit(onSubmit)}
      title="Add Commission"
      confirmText="Save"
      cancelText="Cancel"
      size="md"
      confirmDisabled={!isValid}
    >
      <div className="flex flex-col gap-4">
        <Controller
          name="orgIds"
          control={control}
          render={({ field }) => (
            <AutoComplete
              fullWidth
              label="Select Organisations"
              options={orgOptions}
              value={field.value}
              multiple
              onChange={(e, val) => field.onChange(val as Option[])}
              error={!!errors.orgIds}
              helperText={errors.orgIds?.message as string}
            />
          )}
        />
        <Controller
          name="commissionType"
          control={control}
          render={({ field }) => (
            <Select
              label="Commission Type"
              items={commissionTypeItems}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value as string)}
              error={!!errors.commissionType}
              helperText={errors.commissionType?.message}
            />
          )}
        />
        <div className='flex gap-4 flex-1'>
        {showFlat && (
          <Controller
            name="commissionFlatValue"
            control={control}
            render={({ field }) => (
              <TextField
                label="Flat Value"
                fullWidth
                type="number"
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? undefined : Number(v));
                }}
                error={!!errors.commissionFlatValue}
                helperText={errors.commissionFlatValue?.message as string}
              />
            )}
          />
        )}
        {showPercent && (
          <Controller
            name="commissionPercentValue"
            control={control}
            render={({ field }) => (
              <TextField
                label="Percent Value (%)"
                type="number"
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? undefined : Number(v));
                }}
                error={!!errors.commissionPercentValue}
                helperText={errors.commissionPercentValue?.message as string}
              />
            )}
          />
        )}
        </div>
      </div>
    </Dialog>
  );
}
