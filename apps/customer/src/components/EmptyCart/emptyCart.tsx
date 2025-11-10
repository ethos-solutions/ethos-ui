import React from 'react';
import dynamic from 'next/dynamic';
import EmptyCartIcon from '../../assets/empty-cart.json';
import styles from './emptyCart.module.scss';
import { Label, PrimaryButton } from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

export const EmptyCart = () => {
  const router = useRouter();
  const {t} = useTranslation();
  return (
    <div className={styles.emptyCartContainer}>
      <div className={styles.emptyIcon}>
        <Lottie
          width="300px"
          height="300px"
          options={{
            loop: true,
            autoplay: true,
            animationData: EmptyCartIcon,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
        />
      </div>
      <Label variant="h4" weight="semibold">
        {t('customer.emptyCart')}
      </Label>
      <Label variant="subtitle2">{t('customer.addItemsInCart')}</Label>
      <PrimaryButton className="mt-4" onClick={() => router.push('/explore')}>
        {t('customer.addItems')}
      </PrimaryButton>
    </div>
  );
};
