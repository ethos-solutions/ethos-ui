import React, { useEffect, useState } from 'react';
import styles from './receiveConfirmation.module.scss';
import { Heading, Iconbutton, Label, PrimaryButton, Radio, TextField } from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { setStorage, getStorage } from '@ethos-frontend/utils';
import { OrderNameInput } from './orderNameInput';
import { CheckboxGroup } from './checkboxGroup';
import { DetailsModal } from './detailsModal';
import { useTranslation } from 'react-i18next';
import { getToppingsOptions } from '@ethos-frontend/constants';

export const ReceiveConfirmation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const getToppings = getToppingsOptions();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Invoice type selection
  const [invoiceType, setInvoiceType] = useState<'simplified' | 'fiscal'>('simplified');
  const [fiscalName, setFiscalName] = useState('');
  const [fiscalId, setFiscalId] = useState('');
  const [fiscalAddress, setFiscalAddress] = useState('');

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [checkboxOptions, setCheckboxOptions] = useState(getToppings);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);
  const [orderName, setOrderName] = useState('');
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [restaurantType, setRestaurantType] = useState('');
  const [isSmsValid, setIsSmsValid] = useState(false);
  const [isWhatsappValid, setIsWhatsappValid] = useState(false);

  useEffect(() => {
    // Disable continue if no notification method selected
    // OR if fiscal invoice selected but fields not filled
    const notificationSelected = selectedOptions.length > 0;
    const fiscalFieldsValid = invoiceType === 'simplified' || 
      (fiscalName.trim() && fiscalId.trim());
    
    setIsContinueDisabled(!notificationSelected || !fiscalFieldsValid);
  }, [selectedOptions, invoiceType, fiscalName, fiscalId]);

  useEffect(() => {
    const storedSelectedOptions = JSON.parse(
      getStorage('selectedOptions') || '[]',
    );
    const storedEmail = getStorage('email') || '';
    const storedSms = getStorage('sms') || '';
    const storedWhatsapp = getStorage('whatsapp') || '';
    const storedOrderName = getStorage('orderName') || '';
    const storedInvoiceType = getStorage('invoiceType') || 'simplified';
    const storedFiscalName = getStorage('fiscalName') || '';
    const storedFiscalId = getStorage('fiscalId') || '';
    const storedFiscalAddress = getStorage('fiscalAddress') || '';
    const { restaurantType } = JSON.parse(getStorage('restaurantData') || '{}');
    setRestaurantType(restaurantType);

    setSelectedOptions(
      Array.isArray(storedSelectedOptions) ? storedSelectedOptions : [],
    );
    setEmail(storedEmail);
    setSms(storedSms);
    setWhatsapp(storedWhatsapp);
    setOrderName(storedOrderName);
    setInvoiceType(storedInvoiceType);
    setFiscalName(storedFiscalName);
    setFiscalId(storedFiscalId);
    setFiscalAddress(storedFiscalAddress);
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
    
    // Store fiscal information
    setStorage('invoiceType', invoiceType);
    if (invoiceType === 'fiscal') {
      setStorage('fiscalName', fiscalName);
      setStorage('fiscalId', fiscalId);
      setStorage('fiscalAddress', fiscalAddress);
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

  const invoiceTypeOptions = [
    { label: t('customer.simplifiedInvoice'), value: 'simplified' },
    { label: t('customer.fiscalInvoice'), value: 'fiscal' },
  ];

  return (
    <>
      <div className="pageHolder">
        {/* Invoice Type Selection */}
        <div className="pb-4">
          <Heading className="pb-1" variant="h5" weight="semibold">
            {t('customer.invoiceType')}
          </Heading>
          <Radio
            name="invoice-type"
            options={invoiceTypeOptions}
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value as 'simplified' | 'fiscal')}
          />
          
          {/* Fiscal Information Fields */}
          {invoiceType === 'fiscal' && (
            <div className="mt-4 space-y-3">
              <TextField
                label={t('customer.fiscalName')}
                value={fiscalName}
                onChange={(e) => setFiscalName(e.target.value)}
                placeholder={t('customer.enterName')}
                fullWidth
                required
              />
              <TextField
                label={t('customer.fiscalId')}
                value={fiscalId}
                onChange={(e) => setFiscalId(e.target.value)}
                placeholder={t('customer.enterFiscalId')}
                fullWidth
                required
              />
              <TextField
                label={t('customer.fiscalAddress')}
                value={fiscalAddress}
                onChange={(e) => setFiscalAddress(e.target.value)}
                placeholder={t('customer.enterFiscalAddress')}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Notification Preferences */}
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

        {/* Order Name */}
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
