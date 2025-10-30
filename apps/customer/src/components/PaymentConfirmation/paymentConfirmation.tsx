import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heading, Paragraph, PrimaryButton } from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { useCart } from '../../context/cart';
import { getStorage, removeStorage, setStorage } from '@ethos-frontend/utils';
import { useRestQuery } from '@ethos-frontend/hook';
import { clearSessionStorageExcept } from '../../utils';
import { useTranslation } from 'react-i18next';

interface ISessionStatus {
  data: {
    status: string;
    customer_details: {
      email: string;
    };
    metadata: {
      order_id: string;
    };
    orgId: string;
  };
}

export const PaymentConfirmation = () => {
  const router = useRouter();
  const { query } = router;
  const { setCart } = useCart();
  const { t } = useTranslation();

  const [customerEmail, setCustomerEmail] = useState('');
  const [order, setOrder] = useState('');
  const [org, setOrg] = useState('');
  const [method, setMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('approved');

  useEffect(() => {
    setCustomerEmail(getStorage('email') || '');
    const orderNo = getStorage('orderNo') || '';
    const orgId = getStorage('orgId') || '';
    const paymentMethod = getStorage('paymentMethod') || '';
    const status = getStorage('payment-status') || 'approved';
    setPaymentStatus(status);
    setStorage('order-payment', 'success');
    setMethod(paymentMethod);
    setOrg(orgId);
    setOrder(orderNo);
    setCart([]);
    removeStorage('cart');
  }, []);

  const sessionId = query?.session_id;
  const accountId = query?.acct;

  useRestQuery(
    'checkSession',
    `${process.env.NEXT_PUBLIC_API_URL}admin/organisation/check-session-status/${accountId}/${sessionId}`,
    {
      enabled: Boolean(accountId && sessionId),
      onSuccess: (data: ISessionStatus) => {
        setCustomerEmail(data.data.customer_details.email);
        setOrder(data.data.metadata.order_id);
        setOrg(data.data.orgId);
      },
    },
  );

  useEffect(() => {
    const homepageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${org}`;
    window.history.replaceState(null, '', homepageUrl);
    const handleBackButton = () => {
      window.location.href = `/${org}`;
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [org]);

  return (
    <>
      <div className="orderCon payment_confirmation text-center">
        {paymentStatus === 'pending' ? (
          <>
            <Image
              src="/Payment-Pending-icon.svg"
              alt="pending"
              width={228}
              height={90}
              className="mx-auto"
              onError={(e) => {
                // Fallback to success icon if pending icon doesn't exist
                (e.target as HTMLImageElement).src = "/Payment-Successful-icon.svg";
              }}
            />
            <Heading variant="h5" className="py-3">
              {t('customer.pending.payment') || 'Payment Under Review'}
            </Heading>
            <Paragraph variant="h5" className="pb-2">
              {t('customer.pending.orderReceived', { order: order }) || 
                `Your order (${order}) has been received and is pending payment approval.`}
            </Paragraph>
            <Paragraph variant="h5" className="pb-2">
              {t('customer.pending.notification') || 
                'You will be notified once your payment is approved and your order is confirmed.'}
            </Paragraph>
          </>
        ) : (
          <>
            <Image
              src="/Payment-Successful-icon.svg"
              alt="logo"
              width={228}
              height={90}
              className="mx-auto"
            />
            <Heading variant="h5" className="py-3">
              {t(`customer.success.${method ? 'order' : 'payment'}`)}
            </Heading>
            <Paragraph variant="h5" className="pb-2">
              {t('customer.success.orderProcessed', { order: order })}
            </Paragraph>
          </>
        )}
        {customerEmail && (
          <Paragraph variant="h5">
            {t('customer.success.customerEmail', {
              customerEmail: customerEmail,
            })}
          </Paragraph>
        )}
      </div>
      <div className="sticky-footer-container">
        <PrimaryButton
          className="mt-auto"
          onClick={() => {
            window.location.href = `/${org}`;
            clearSessionStorageExcept(['orgId', 'userSelectedLanguage']);
          }}
          fullWidth
        >
          {t('customer.orderAgain')}
        </PrimaryButton>
      </div>
    </>
  );
};
