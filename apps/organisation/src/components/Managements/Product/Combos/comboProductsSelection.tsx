import {
  Card,
  ControlledDropdown,
  ControlledInput,
} from '@ethos-frontend/components';
import { Heading, Iconbutton, PrimaryButton } from '@ethos-frontend/ui';
import { Add } from '@mui/icons-material';
import { ComboDetailsProps } from '../ProductForm/formTypes';
import { ComboOptions } from './comboOptions';
import { useTranslation } from 'react-i18next';
import { comboType } from '@ethos-frontend/constants';

export const ComboProductSelection = ({
  control,
  watchCombos,
  comboProducts,
  singleComboProducts,
  append,
  handleComboProductChange,
  handleSingleProductChange,
  onRemoveCombo,
  productList,
  errors,
}: ComboDetailsProps) => {
  const { t } = useTranslation();
  const getComboType = comboType();
  return (
    <Card title={t('product.chooseProducts')} className='mt-4'>
      <div className="flex flex-col gap-4">
        {watchCombos?.map((comboField, comboIndex) => {
            return (
              <div key={comboField.id}>
                <div>
                  <Heading variant="h4" className="pb-4 flex justify-between">
                    {t('product.title')} {comboIndex + 1}
                    {onRemoveCombo && watchCombos.length > 2 && (
                      <Iconbutton
                        name="delete"
                        iconColor="red"
                        onClick={() => onRemoveCombo(comboIndex)}
                      />
                    )}
                  </Heading>
                  <div className="flex gap-4">
                    <ControlledDropdown
                      name={`combos.${comboIndex}.type`}
                      control={control}
                      options={getComboType}
                      errors={errors}
                      helperText={errors}
                      placeholder={t('product.productType')}
                      value={comboField.type}
                    />
                    {comboField.type === 'Single' && (
                      <ControlledDropdown
                        name={`combos.${comboIndex}.product`}
                        control={control}
                        options={productList}
                        placeholder={t('product.productName')}
                        errors={errors}
                        helperText={errors}
                        value={singleComboProducts[comboIndex] || ''}
                        onChange={(e) =>
                          handleSingleProductChange(
                            comboIndex,
                            e as unknown as string,
                          )
                        }
                      />
                    )}
                  </div>
                  {comboField.type === 'Multiple' && (
                    <Card className="mt-5">
                      <div className="flex flex-col gap-4">
                        <ControlledInput
                          name={`combos.${comboIndex}.comboTitle`}
                          control={control}
                          placeholder={t('product.comboTitle')}
                          errors={errors}
                          required
                          helperText={errors}
                          type="text"
                          fullWidth
                        />
                        <ComboOptions
                          control={control}
                          comboIndex={comboIndex}
                          productList={productList}
                          comboProducts={comboProducts}
                          handleComboProductChange={handleComboProductChange}
                          errors={errors}
                        />
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        <PrimaryButton
          onClick={() => append({ type: 'Single' })}
          variant="outlined"
          size="small"
          startIcon={<Add fontSize="small" />}
        >
          {t('product.addProduct')}
        </PrimaryButton>
      </div>
    </Card>
  );
};
