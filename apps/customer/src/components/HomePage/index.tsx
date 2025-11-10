import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import styles from './homepage.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import {
  Heading,
  Iconbutton,
  Label,
  Modal,
  Paragraph,
  PrimaryButton,
} from '@ethos-frontend/ui';
import {
  getLanguageLabel,
  getStorage,
  removeStorage,
  setStorage,
  useIsMobile,
} from '@ethos-frontend/utils';
import { TableNumberModal } from './tableNumberModal';
import { ORDER_TYPE, LANGUAGE_TYPE } from '../../constant';
import Dinein from '../../assets/dinein.json';
import Takeaway from '../../assets/takeaway.json';
import { clearSessionStorageExcept } from '../../utils';
import { LanguageSwitcher } from './LanguageSwitcher';

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

interface IRestaurant {
  order_type: ORDER_TYPE[];
  language: LANGUAGE_TYPE[];
  restaurantName: string;
  imageUrl: string;
  isEnabled: boolean;
  restaurantType: string;
  default_language: string;
  businessType: string;
}

export const HomePage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { i18n, t } = useTranslation();
  const clearedOnce = useRef(false);
  const [open, setOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [customerNumber, setCustomerNumber] = useState<string>('');
  const [languageSwitcher, setLanguageSwitcher] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<ORDER_TYPE>();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        tableNumber: Yup.string().required(t('errors.requiredField')),
      }),
    [t]
  );

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!clearedOnce.current) {
      clearSessionStorageExcept(['orgId', 'userSelectedLanguage']);
      clearedOnce.current = true;
      const storedId = getStorage('orgId');
      setRestaurantId(storedId);
      if (!storedId) {
        router.replace('/error');
      }
    }
  }, []);

  useEffect(() => {
    const loginApi = async () => {
      if (!restaurantId) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: restaurantId }),
        });

        if (!response.ok) throw new Error('Login failed');

        const { login } = await response.json();
        setRestaurant(login);
        const storedLanguage = getStorage('userSelectedLanguage');

        if (storedLanguage) {
          i18n.changeLanguage(storedLanguage);
        } else {
          i18n.changeLanguage(login?.default_language);
        }

        setStorage('restaurantData', JSON.stringify(login));
        setStorage('accessToken', login?.accessToken);
      } catch (_error) {
        toast.error('Login failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (!restaurant) loginApi();
  }, [restaurantId, i18n, restaurant]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const orderTypeSelection = () => {
    if (!restaurant) return null;
    let types = [...restaurant.order_type];
    if (restaurant.businessType === 'Hotels') {
      types = types.filter((t) => t !== ORDER_TYPE.takeaway);

      if (!types.includes(ORDER_TYPE.roomService)) {
        types.push(ORDER_TYPE.roomService);
      }
    }

    const orderTypeDetails: Record<
      ORDER_TYPE,
      { displayName: string; icon: any }
    > = {
      [ORDER_TYPE.takeaway]: {
        displayName: t('takeAway'),
        icon: Takeaway,
      },
      [ORDER_TYPE.roomService]: {
        displayName: t('customer.roomService'),
        icon: Takeaway,
      },
      [ORDER_TYPE.dine]: {
        displayName: t('dineIn'),
        icon: Dinein,
      },
    };

    return types.map((val) => {
      const details = orderTypeDetails[val];
      if (!details) return null;
      return (
        <div
          key={val}
          className={`flex ${styles.box} text-center ${
            selectedOrderType === val ? styles.selected : ''
          }`}
          onClick={() => {
            setSelectedOrderType(val);
            setStorage('orderType', val);
          }}
        >
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: details.icon,
            }}
          />
          <Label variant="h5" className="py-2" weight="medium">
            {details.displayName}
          </Label>
        </div>
      );
    });
  };

  const onSubmit = (data: Record<string, unknown>) => {
    if (selectedOrderType === ORDER_TYPE.dine && data?.tableNumber) {
      setStorage('tableNumber', customerNumber);
    }
    if (selectedOrderType === ORDER_TYPE.roomService && data?.tableNumber) {
      setStorage('roomNo', customerNumber);
    }
    router.push('/explore');
  };

  return (
    <>
      {!isLoading && restaurant && !restaurant?.isEnabled ? (
        <Modal open>
          <Paragraph
            variant="subtitle1"
            weight="semibold"
            className="text-center"
          >
            {restaurant?.restaurantName} {t('customer.restaurantClosed')}
          </Paragraph>
        </Modal>
      ) : (
        <div className={styles.homeStyle}>
          <div className="flex flex-col items-center h-full sm:w-80 xs:w-72">
            <div className="grid grid-cols-1 gap-4 w-full mt-8">
              <span
                className={`flex ${styles.languageSwitcher}`}
                onClick={() => setLanguageSwitcher(true)}
              >
                <span>{getLanguageLabel(i18n.language)}</span>
                <Iconbutton name="down-arrow" />
              </span>
              {restaurant?.imageUrl && (
                <div className="h-28 w-52">
                  <Image
                    src={restaurant.imageUrl}
                    width={200}
                    height={200}
                    alt="Restaurant Logo"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              )}
              <Heading variant="h2" weight="semibold">
                {t('customer.welcomeTo')} <br /> {restaurant?.restaurantName}!
              </Heading>
            </div>

            <div className="text-left my-auto pb-8">
              <Label variant="h4" weight="medium" className="flex pb-6">
                {t('customer.whereToEat')}
              </Label>
              <div className="grid grid-cols-2 gap-4 w-full">
                {orderTypeSelection()}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full mt-auto">
              <PrimaryButton
                fullWidth
                onClick={() => {
                  if (
                    (selectedOrderType === ORDER_TYPE.dine &&
                      restaurant?.restaurantType?.[0] === 'full_service') ||
                    selectedOrderType === ORDER_TYPE.roomService
                  ) {
                    setOpen(true);
                  } else {
                    removeStorage('tableNumber');
                    router.push('/explore');
                  }
                }}
                disabled={!selectedOrderType}
              >
                {t('customer.startYourOrder')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <LanguageSwitcher
        languageSwitcher={languageSwitcher}
        setLanguageSwitcher={setLanguageSwitcher}
        data={restaurant?.language || []}
      />

      <TableNumberModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit(onSubmit)}
        isMobile={isMobile}
        control={control}
        errors={errors}
        setCustomerNumber={setCustomerNumber}
        orderType={selectedOrderType}
      />
    </>
  );
};
