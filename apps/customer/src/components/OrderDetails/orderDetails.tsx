import React, { useEffect, useState } from 'react';
import styles from './orderDetails.module.scss';
import {
  Heading,
  Iconbutton,
  Label,
  Modal,
  Paragraph,
  PrimaryButton,
  Radio,
  TextField,
} from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { useCart } from '../../context/cart';
import { getStorage, priceWithSymbol, setStorage } from '@ethos-frontend/utils';
import { useTranslation } from 'react-i18next';

export const OrderDetails = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart } = useCart();
  const [subTotalPrice, setSubTotalPrice] = useState<number>(0);
  const [taxMode, setTaxMode] = useState('');
  const [tax, setTax] = useState(0);
  const [serviceFee, setServiceFee] = useState<{
    valueType: string;
    value: number;
  }>();
  const [tips, setTips] = useState([]);
  const [selectedTip, setSelectedTip] = useState('');
  const [_selectedTipValue, setSelectedTipValue] = useState('');
  const [customTip, setCustomTip] = useState<string>('');
  const [isAddTipDisabled, setIsAddTipDisabled] = useState(true);
  const [addTipAmount, setAddTipAmount] = useState(0);
  const [confirmationModal, setConfimationModal] = useState(false);
  const [invoiceChoice, setInvoiceChoice] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    const { taxMode, serviceFee, tips } = JSON.parse(
      getStorage('restaurantData') || '{}',
    );
    setServiceFee(serviceFee);
    setTax(Number(getStorage('totalTax')));
    setTaxMode(taxMode);
    setSubTotalPrice(Number(getStorage('subTotal')));
    setTips(tips);
    setSelectedTip(getStorage('selectedTip') || '');
    setSelectedTipValue(getStorage('selectedTipValue') || '');
    const selectedOptions = JSON.parse(getStorage('selectedOptions') || '[]');
    setSelectedOptions(selectedOptions);

    setInvoiceChoice(
      selectedOptions.some(
        (choice: string) => choice === 'not' || choice === 'email',
      ) &&
        !selectedOptions.some(
          (choice: string) => choice === 'whatsapp' || choice === 'sms',
        ),
    );
  }, []);

  const tipOptions = [{ label: t('customer.noTip'), value: '0' }].concat(
    tips.map((val: number) => ({
      label: `${val}%`,
      value: val.toString(),
    })),
  );

  const calculateSubtotal = () => {
    return taxMode === 'included' ? subTotalPrice : subTotalPrice + tax;
  };

  const calculateServiceFee = (subtotal: number) => {
    if (!serviceFee) return 0;
    return serviceFee.valueType === 'Percentage'
      ? (serviceFee.value / 100) * subtotal
      : serviceFee.value;
  };

  const calculateTip = (subtotal: number) => {
    if (addTipAmount) {
      return addTipAmount;
    }
    if (selectedTip !== '0') {
      return (parseFloat(selectedTip) / 100) * subtotal;
    }
    return 0;
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTip(value);
    setIsAddTipDisabled(!value);
  };

  const handleAddTip = () => {
    if (customTip) setAddTipAmount(parseFloat(customTip));
    setIsAddTipDisabled(true);
    setSelectedTip('');
    setSelectedTipValue('');
    setCustomTip('');
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTip(e.target.value);
    setAddTipAmount(0);
    setCustomTip('');
    setIsAddTipDisabled(true);
  };

  const handleRemoveTip = () => {
    setSelectedTip('');
    setSelectedTipValue('');
    setAddTipAmount(0);
    setCustomTip('');
  };

  const beforeSubtotal = calculateSubtotal();
  const serviceFeeAmount = calculateServiceFee(beforeSubtotal);
  const tipAmount = calculateTip(beforeSubtotal);
  const subtotal = beforeSubtotal + (tipAmount ? tipAmount : 0);
  const total = subtotal + serviceFeeAmount;

  useEffect(() => {
    if (total || tipAmount || serviceFee) {
      setStorage('TotalPrice', total.toFixed(2).toString());
      setStorage('selectedTip', selectedTip);
      setStorage(
        'selectedTipValue',
        tipAmount ? tipAmount.toFixed(2).toString() : '0',
      );
      setStorage(
        'serviceCharge',
        serviceFeeAmount ? serviceFeeAmount.toFixed(2).toString() : '0',
      );
    }
  }, [total, tipAmount, serviceFee, serviceFeeAmount]);

  return (
    <>
      <div className={styles.card}>
        <Heading variant="h5" weight="bold" className="pb-5">
          {t('orderDetails')}
        </Heading>
        <ul className={styles.orderDetails}>
          {cart.map(({ name, finalPrice, quantity }, index) => {
            return (
              <li key={index}>
                <Label variant="subtitle2">{name} </Label>
                <span>
                  <Label variant="body1">{quantity} x </Label>
                  <Label variant="subtitle2">
                    {priceWithSymbol(finalPrice)}
                  </Label>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.tip}>
        <Heading variant="h5" weight="bold">
          {t('customer.enterTip')}
        </Heading>
        {tipOptions.length > 1 ? (
          <div className="pt-5">
            <Radio
              variant="tile"
              align="horizontal"
              options={tipOptions}
              name="tips"
              value={selectedTip}
              onChange={handleTipChange}
            />
          </div>
        ) : null}

        <div className={styles.inputHolder}>
          <TextField
            name="custom-tip"
            value={customTip}
            onChange={handleCustomTipChange}
            label={t('customer.addCustomAmount')}
            fullWidth
            type="number"
            className='flex-1'
          />
          <PrimaryButton onClick={handleAddTip} disabled={isAddTipDisabled}>
            {t('customer.addTip')}
          </PrimaryButton>
        </div>
      </div>

      <div className={styles.details}>
        <Heading variant="h5" weight="bold" className="pb-5">
          {t('customer.details')}
        </Heading>
        <ul className={styles.orderList}>
          <li>
            <Label variant="subtitle2">{t('customer.itemTotal')}</Label>{' '}
            <Label variant="subtitle2">{priceWithSymbol(subTotalPrice)}</Label>
          </li>
          <li>
            <Label variant="subtitle2">
              {t('customer.tax')} (
              {taxMode === 'included' ? 'included' : 'excluded'})
            </Label>{' '}
            <Label variant="subtitle2">{priceWithSymbol(tax)}</Label>
          </li>
          {tipAmount ? (
            <li>
              <span className="flex gap-2 items-center">
                <Label variant="subtitle2">{t('tip')}</Label>{' '}
                <Iconbutton
                  name="close"
                  text={t('customer.removeTip')}
                  iconColor="red"
                  textColor="red"
                  size="small"
                  className="!p-0 !min-h-min"
                  onClick={handleRemoveTip}
                />
              </span>
              <Label variant="subtitle2">
                {priceWithSymbol(Number(tipAmount.toFixed(2)))}
              </Label>
            </li>
          ) : null}
          <hr />
          <li>
            <Label variant="subtitle2" weight="bold">
              {t('customer.subTotal')}{' '}
            </Label>
            <Label variant="subtitle2" weight="bold">
              {priceWithSymbol(Number(subtotal.toFixed(2)))}
            </Label>
          </li>
          {serviceFeeAmount ? (
            <li>
              <Label variant="subtitle2">{t('serviceCharge')}</Label>{' '}
              <Label variant="subtitle2">
                {priceWithSymbol(Number(serviceFeeAmount.toFixed(2)))}
              </Label>
            </li>
          ) : null}

          <li>
            <Label variant="subtitle2" weight="bold">
              {t('total')}{' '}
            </Label>
            <Label variant="subtitle2" weight="bold">
              {priceWithSymbol(Number(total.toFixed(2)))}
            </Label>
          </li>
        </ul>
      </div>
      <div className="sticky-footer-container">
        <PrimaryButton
          fullWidth
          className="!mt-auto"
          onClick={() => {
            if (invoiceChoice) {
              setConfimationModal(true);
            } else {
              router.push('/payment');
            }
          }}
        >
          {t('customer.continuePayment')}
        </PrimaryButton>
      </div>
      <Modal
        title={t('customer.wantToProceed')}
        open={confirmationModal}
        onClose={() => setConfimationModal(false)}
      >
        <>
          <Paragraph variant="subtitle1" weight="medium" className="pb-2">
            {(() => {
              if (selectedOptions.includes('not')) {
                return t('customer.notSelectedAnything');
              }

              if (
                selectedOptions.includes('email') &&
                !selectedOptions.includes('sms') &&
                !selectedOptions.includes('whatsapp')
              ) {
                return t('customer.notSelectedSmsorWhatsapp');
              }
            })()}
          </Paragraph>
          <Paragraph variant="subtitle1" weight="medium">
            {(() => {
              if (selectedOptions.includes('not')) {
                return t('customer.receiveReceiptQuestion');
              }

              if (
                selectedOptions.includes('email') &&
                !selectedOptions.includes('sms') &&
                !selectedOptions.includes('whatsapp')
              ) {
                return t('customer.addPhoneNumberToReceiveNotification');
              }
            })()}
          </Paragraph>
          <div className="pt-5 flex justify-end gap-5 items-center">
            <PrimaryButton
              variant="outlined"
              onClick={() => {
                setConfimationModal(false);
                router.push('/payment');
              }}
            >
              {t('continue')}
            </PrimaryButton>
            <PrimaryButton onClick={() => router.push('/confirmation')}>
              {t('customer.addContactDetails')}
            </PrimaryButton>
          </div>
        </>
      </Modal>
    </>
  );
};
