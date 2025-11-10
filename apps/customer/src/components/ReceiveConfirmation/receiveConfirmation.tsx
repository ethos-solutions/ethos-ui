import React, { useEffect, useState } from 'react';
import styles from './receiveConfirmation.module.scss';
import { Heading, Iconbutton, Label, PrimaryButton, Radio, TextField, Select } from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { setStorage, getStorage } from '@ethos-frontend/utils';
import { OrderNameInput } from './orderNameInput';
import { CheckboxGroup } from './checkboxGroup';
import { DetailsModal } from './detailsModal';
import { useTranslation } from 'react-i18next';
import { getToppingsOptions, getDocumentTypes } from '@ethos-frontend/constants';

export const ReceiveConfirmation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const getToppings = getToppingsOptions();
  const documentTypes = getDocumentTypes();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [fiscalDocumentType, setFiscalDocumentType] = useState('13');
  const [fiscalName, setFiscalName] = useState('');
  const [fiscalId, setFiscalId] = useState('');

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [checkboxOptions, setCheckboxOptions] = useState(getToppings);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  const [orderName, setOrderName] = useState('');
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [_restaurantType, setRestaurantType] = useState('');
  const [isSmsValid, setIsSmsValid] = useState(false);
  const [isWhatsappValid, setIsWhatsappValid] = useState(false);

  const isCompany = fiscalDocumentType === '31';

  useEffect(() => {
    const notificationSelected = selectedOptions.length > 0;
    const fiscalFieldsValid = 
      !needsInvoice || 
      (fiscalName.trim() && fiscalId.trim());
    
    setIsContinueDisabled(!notificationSelected || !fiscalFieldsValid);
  }, [selectedOptions, needsInvoice, fiscalName, fiscalId]);

  useEffect(() => {
    const storedSelectedOptions = JSON.parse(
      getStorage('selectedOptions') || '[]',
    );
    const storedEmail = getStorage('email') || '';
    const storedSms = getStorage('sms') || '';
    const storedWhatsapp = getStorage('whatsapp') || '';
    const storedOrderName = getStorage('orderName') || '';
    const storedNeedsInvoice = getStorage('needsInvoice') === 'true';
    const storedFiscalDocumentType = getStorage('fiscalDocumentType') || '13';
    const storedFiscalName = getStorage('fiscalName') || '';
    const storedFiscalId = getStorage('fiscalId') || '';
    const { restaurantType } = JSON.parse(getStorage('restaurantData') || '{}');
    setRestaurantType(restaurantType);

    setSelectedOptions(
      Array.isArray(storedSelectedOptions) ? storedSelectedOptions : [],
    );
    setEmail(storedEmail);
    setSms(storedSms);
    setWhatsapp(storedWhatsapp);
    setOrderName(storedOrderName);
    setNeedsInvoice(storedNeedsInvoice);
    setFiscalDocumentType(storedFiscalDocumentType);
    setFiscalName(storedFiscalName);
    setFiscalId(storedFiscalId);
    setIsWhatsappValid(storedWhatsapp ? true : false);
    setIsSmsValid(storedSms ? true : false);

    const newCheckboxOptions = getToppings.map((option) => {
      switch (option.value) {
        case 'email':
          return {
            ...option,
            label: storedEmail || t('email'),
            icon: <Iconbutton name="email" />,
          };
        case 'sms':
          return {
            ...option,
            label: storedSms ? `*** *** ${storedSms.slice(-4)}` : t('sms'),
            icon: <Iconbutton name="sms" />,
          };
        case 'whatsapp':
          return {
            ...option,
            label: storedWhatsapp
              ? `*** *** ${storedWhatsapp.slice(-4)}`
              : t('whatsapp'),
            icon: <Iconbutton name="message" />,
          };
        default:
          return option;
      }
    });

    setCheckboxOptions(newCheckboxOptions);
  }, []);

  const handleCheckboxChange = (
    selectedValues: { label: string; value: string }[],
  ) => {
    const values = selectedValues.map((option) => option.value);

    if (values.includes('not')) {
      setSelectedOptions(['not']);
      setStorage('selectedOptions', JSON.stringify(['not']));
      setOpen(false);
    } else {
      setSelectedOptions(values);
      setStorage('selectedOptions', JSON.stringify(values));
      setOpen(false);
    }
  };

  const onSubmit = () => {
    if (selectedOptions.includes('email') && email) setStorage('email', email);

    if (selectedOptions.includes('sms') && sms && isSmsValid)
      setStorage('sms', sms);

    if (selectedOptions.includes('whatsapp') && whatsapp && isWhatsappValid)
      setStorage('whatsapp', whatsapp);

    const newCheckboxOptions = getToppings.map((option) => {
      switch (option.value) {
        case 'email':
          return { ...option, label: email || t('email') };
        case 'sms':
          return {
            ...option,
            label: sms ? `*** *** ${sms.slice(-4)}` : t('sms'),
          };
        case 'whatsapp':
          return {
            ...option,
            label: whatsapp ? `*** *** ${whatsapp.slice(-4)}` : t('whatsapp'),
          };
        default:
          return option;
      }
    });

    setCheckboxOptions(newCheckboxOptions);
    handleClose();
    router.push('/checkout');
  };

  const handleContinueClick = () => {
    if (orderName) setStorage('orderName', orderName);
    
    // Store invoice information
    setStorage('needsInvoice', needsInvoice.toString());
    if (needsInvoice) {
      setStorage('fiscalDocumentType', fiscalDocumentType);
      setStorage('fiscalName', fiscalName);
      setStorage('fiscalId', fiscalId);
      // Determine invoice type based on document type
      const invoiceType = fiscalDocumentType === '31' ? 'nit' : 'documento';
      setStorage('invoiceType', invoiceType);
    } else {
      setStorage('invoiceType', 'simple');
    }
    
    if (
      selectedOptions.includes('email') ||
      selectedOptions.includes('sms') ||
      selectedOptions.includes('whatsapp')
    ) {
      handleOpen();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <>
      <div className="pageHolder">
        <div className="pb-4">
          <Heading className="pb-1" variant="h5" weight="semibold">
            {t('customer.needInvoice') || '¿Necesitas factura con datos fiscales?'}
          </Heading>
          <Radio
            name="needs-invoice"
            options={[
              { label: t('customer.yes') || 'Sí', value: 'yes' },
              { label: t('customer.no') || 'No', value: 'no' },
            ]}
            value={needsInvoice ? 'yes' : 'no'}
            onChange={(e) => {
              const value = e.target.value === 'yes';
              setNeedsInvoice(value);
              if (!value) {
                setFiscalName('');
                setFiscalId('');
                setFiscalDocumentType('13');
              }
            }}
          />
        </div>

        {needsInvoice && (
          <div className="pb-4">
            <Heading className="pb-1" variant="h5" weight="semibold">
              {t('customer.howDoYouIdentify') || '¿Cómo te identificas?'}
            </Heading>
            <Label className="pb-3 block" variant="subtitle2">
              {t('customer.selectDocumentType') || 'Selecciona tu tipo de documento'}
            </Label>
            
            <div className="mb-4">
              <select
                value={fiscalDocumentType}
                onChange={(e) => {
                  setFiscalDocumentType(e.target.value);
                  setFiscalName('');
                  setFiscalId('');
                }}
                className="w-full p-3 border rounded-lg text-base"
                required
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {isCompany && (
              <div className="space-y-3">
                <TextField
                  label={t('customer.businessName') || 'Razón Social'}
                  value={fiscalName}
                  onChange={(e) => setFiscalName(e.target.value)}
                  placeholder="Mi Empresa S.A.S."
                  fullWidth
                  required
                />
                <TextField
                  label="NIT"
                  value={fiscalId}
                  onChange={(e) => setFiscalId(e.target.value)}
                  placeholder="901234567"
                  fullWidth
                  required
                  helperText={t('customer.nitHelper') || 'Sin dígito de verificación'}
                />
              </div>
            )}

            {!isCompany && (
              <div className="space-y-3">
                <TextField
                  label={t('customer.fullName') || 'Nombre Completo'}
                  value={fiscalName}
                  onChange={(e) => setFiscalName(e.target.value)}
                  placeholder="Juan Pérez"
                  fullWidth
                  required
                />
                <TextField
                  label={t('customer.documentNumber') || 'Número de Documento'}
                  value={fiscalId}
                  onChange={(e) => setFiscalId(e.target.value)}
                  placeholder="123456789"
                  fullWidth
                  required
                />
              </div>
            )}
          </div>
        )}

        <div className="pb-4">
          <Heading className="pb-1" variant="h5" weight="semibold">
            {t('customer.receiveConfirmation')}
          </Heading>
          <Label className="pb-4 block" variant="subtitle2">
            {t('customer.orderStatusUpdates')}
          </Label>
          <CheckboxGroup
            selectedValues={selectedOptions.map((value) => ({
              label:
                checkboxOptions.find((option) => option.value === value)
                  ?.label || '',
              value,
            }))}
            options={checkboxOptions}
            onGroupChange={handleCheckboxChange}
          />
        </div>

        <div className="pt-4">
          <Heading className="pb-4" variant="h5" weight="semibold">
            {t('customer.identifyOrder')}
          </Heading>
          <OrderNameInput
            orderName={orderName}
            onChange={(e) => setOrderName(e.target.value)}
          />
        </div>

        <div className="sticky-footer-container">
          <PrimaryButton
            className={styles.continueBtn}
            disabled={isContinueDisabled}
            onClick={handleContinueClick}
            fullWidth
          >
            {t('continue')}
          </PrimaryButton>
        </div>
      </div>
      <DetailsModal
        open={open}
        handleClose={handleClose}
        selectedOptions={selectedOptions}
        email={email}
        sms={sms}
        whatsapp={whatsapp}
        setEmail={setEmail}
        setSms={setSms}
        setWhatsapp={setWhatsapp}
        onSubmit={onSubmit}
        isSmsValid={isSmsValid}
        isWhatsappValid={isWhatsappValid}
        setIsSmsValid={setIsSmsValid}
        setIsWhatsappValid={setIsWhatsappValid}
      />
    </>
  );
};
