import { CircularProgress } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { STRIPE_CONNECT_STATUS } from '../../constants/messages';

import {
  ControlledDropdown,
  ControlledInput,
  ControlledRadio,
  GridContainer,
  ControlledCheckbox,
  Card,
} from '@ethos-frontend/components';
import { useMutation, useQuery } from '@apollo/client';
import * as Yup from 'yup';
import {
  Control,
  FieldErrors,
  FieldValues,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Iconbutton,
  Label,
  Paragraph,
  PrimaryButton,
} from '@ethos-frontend/ui';
import { getNumberOfCols, useResponsive } from '@ethos-frontend/utils';
import { UPDATE_ACCOUNT } from '../../api/mutations/Account';
import { toast } from 'react-toastify';
import { useRestMutation, useRestQuery } from '@ethos-frontend/hook';
import { GET_ACCOUNT_PREFERENCES } from '../../api/queries/Account';
import { useUser } from '../../context/user';
import { Bill } from './bill';
import { Theme } from './theme';
import {
  API_METHODS,
  API_URL,
  getOrderType,
  getPaymentType,
  ERROR_MESSAGES,
  getLanguageOptions,
  restaurantType,
  restaurantTaxMode,
  restaurantServiceFee,
} from '@ethos-frontend/constants';
import { t } from 'i18next';
interface ICheckbox {
  label: string;
  value: string;
}

const AccountPreferences = () => {
  const { userData } = useUser();
  const languageOptions = getLanguageOptions();
  const getTaxMode = restaurantTaxMode();
  const getServiceFee = restaurantServiceFee();
  const getRestaurantType = restaurantType();
  const orderTypes = getOrderType(userData?.businessType);
  const paymentTypes = getPaymentType();
  const { isMobile, isDesktop } = useResponsive();
  const [serviceFee, setServiceFee] = useState('');
  const [connected, setConnected] = useState<{
    stripeConnectStatus: string;
    stripeConnectAcctId: string;
  }>();
  const [mpConnected, setMpConnected] = useState<{
    connected: boolean;
    status: string;
    userId: string | null;
  }>({ connected: false, status: 'NOT_CONNECTED', userId: null });
  const [paymentType, setPaymentType] = useState<ICheckbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [orderType, setOrderType] = useState<ICheckbox[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('');
  // const [restaurantType, setRestaurantType] = useState('');
  const [taxMode, setTaxMode] = useState('');

  const validationSchema = useMemo(() => {
    // decide once whether restaurant is required
    const restaurantField =
      userData?.businessType !== 'Hotels'
        ? Yup.string().required(ERROR_MESSAGES.REQUIRED)
        : Yup.string().notRequired();

    return Yup.object({
      paymentType: Yup.array()
        .of(
          Yup.object({
            value: Yup.string().required(ERROR_MESSAGES.REQUIRED),
            label: Yup.string().required(ERROR_MESSAGES.REQUIRED),
          }),
        )
        .min(1, ERROR_MESSAGES.AT_LEAST_ONE)
        .required(ERROR_MESSAGES.REQUIRED),

      restaurant: restaurantField,

      language: Yup.array()
        .of(Yup.string())
        .min(1, ERROR_MESSAGES.AT_LEAST_ONE)
        .required(ERROR_MESSAGES.REQUIRED),

      default_language: Yup.string().required(ERROR_MESSAGES.REQUIRED),

      orderType: Yup.array()
        .of(
          Yup.object({
            value: Yup.string().required(ERROR_MESSAGES.REQUIRED),
            label: Yup.string().required(ERROR_MESSAGES.REQUIRED),
          }),
        )
        .min(1, ERROR_MESSAGES.AT_LEAST_ONE)
        .required(ERROR_MESSAGES.REQUIRED),

      tax: Yup.string().required(ERROR_MESSAGES.REQUIRED),

      serviceFeeRadio: Yup.string().required(ERROR_MESSAGES.REQUIRED),

      serviceFee: Yup.number().nullable().typeError(ERROR_MESSAGES.REQUIRED),

      extras: Yup.array().of(
        Yup.object({
          tip: Yup.number()
            .typeError(ERROR_MESSAGES.SHOULD_NUMBER)
            .required(ERROR_MESSAGES.REQUIRED)
            .min(0, ERROR_MESSAGES.TIP_ZERO),
        }),
      ),
    });
  }, [userData?.businessType]);

  const { data: accountData } = useQuery(GET_ACCOUNT_PREFERENCES, {
    onError: (err) => {
      toast.error(t('errors.general'));
    },
  });

  const { refetch: fetchLinkStripeConnect } = useRestQuery(
    'stripe-link',
    API_URL.linkStripeAccount,
    {
      enabled: false,
    },
  );

  const { refetch: regenerateLink } = useRestQuery(
    'regenerate-connect-link',
    `${API_URL.regenerateStripeLink}/${connected?.stripeConnectAcctId}`,
    {
      enabled: false,
    },
  );

  const { refetch: fetchMpStatus } = useRestQuery(
    'mp-status',
    `admin/organisation/mp/status`,
    {
      enabled: false,
      onSuccess: (data: any) => {
        setMpConnected({
          connected: data.data.connected,
          status: data.data.status,
          userId: data.data.userId,
        });
      },
    },
  );

  const { refetch: fetchMpOAuthLink } = useRestQuery(
    'mp-oauth-link',
    `admin/organisation/mp/oauth/initiate`,
    {
      enabled: false,
    },
  );

  const { refetch: fetchMpDashboardLink } = useRestQuery(
    'mp-dashboard-link',
    `admin/organisation/mp-dashboard-link`,
    {
      enabled: false,
    },
  );

  const [updateAccount, { loading: updateAccountLoading }] = useMutation(
    UPDATE_ACCOUNT,
    {
      onCompleted: () => {
        toast.success('Account Preferences Updated!!');
      },
      refetchQueries: [GET_ACCOUNT_PREFERENCES],
    },
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      paymentType: [],
      restaurant: '',
      orderType: [],
      tax: '',
      serviceFee: 0,
      language: [],
      default_language: '',
      extras: [],
      serviceFeeRadio: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extras',
  });

  useEffect(() => {
    if (userData) {
      setConnected({
        stripeConnectStatus: userData.stripeConnectStatus || '',
        stripeConnectAcctId: userData.stripeConnectAcctId || '',
      });
      // Fetch MP status
      fetchMpStatus();
    }
  }, [userData, regenerateLink]);

  // Handle MP OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mpConnected = urlParams.get('mp_connected');
    
    if (mpConnected === 'true') {
      toast.success(t('success.mpConnected') || 'Successfully connected to Mercado Pago!');
      fetchMpStatus(); // Refresh status
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (mpConnected === 'false') {
      toast.error(t('errors.mpConnectionFailed') || 'Failed to connect to Mercado Pago. Please try again.');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnectWithStripe = async () => {
    setLoading(true);

    try {
      // @ts-ignore
      const linkResponse: { data?: { data?: { url?: string } } } =
        connected?.stripeConnectStatus === STRIPE_CONNECT_STATUS.NOT_CONNECTED
          ? await fetchLinkStripeConnect()
          : await regenerateLink();

      if (linkResponse?.data) {
        window.open(linkResponse?.data?.data?.url, '_blank');
      }
    } catch (error) {
      toast.error('Failed to connect with Stripe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWithMercadoPago = async () => {
    setMpLoading(true);

    try {
      // @ts-ignore
      const linkResponse: { data?: { data?: { url?: string } } } = await fetchMpOAuthLink();

      if (linkResponse?.data?.data?.url) {
        // Redirect to Mercado Pago OAuth (full page redirect)
        window.location.href = linkResponse.data.data.url;
      }
    } catch (error) {
      toast.error('Failed to connect with Mercado Pago. Please try again.');
      setMpLoading(false);
    }
  };

  const handleOpenMpDashboard = async () => {
    try {
      // @ts-ignore
      const response: { data?: { data?: { url?: string } } } = await fetchMpDashboardLink();

      if (response?.data?.data?.url) {
        window.open(response.data.data.url, '_blank');
      }
    } catch (error) {
      toast.error('Failed to open Mercado Pago dashboard. Please try again.');
    }
  };

  const onSubmit = (data: Record<string, unknown>) => {
    const params: Record<string, unknown> = {
      payment: (data.paymentType as { value: string }[]).map((e) => e.value),
      language: data.language,
      default_language: data.default_language,
      order_type: (data.orderType as { value: string }[]).map((e) => e.value),
      serviceFee: {
        value: data.serviceFee,
        valueType: serviceFee,
      },
      taxMode: data.tax,
      tips: (data.extras as { tip?: number }[]).map((e) => e.tip),
    };

    if (userData?.businessType !== 'Hotels') {
      params.restaurantType = data.restaurant;
    }

    const preferences = { params };

    localStorage.setItem(
      'interface_lang',
      JSON.stringify(data?.language) || '[]',
    );
    updateAccount({ variables: preferences });
  };

  useEffect(() => {
    if (accountData) {
      const AccountPreferenceData = accountData.account.data;

      const paymentTypeOptions =
        AccountPreferenceData.payment?.map((payment: string) => ({
          label: payment,
          value: payment,
        })) || [];
      const orderTypeOptions =
        AccountPreferenceData.order_type?.map((order: string) => ({
          label: order,
          value: order,
        })) || [];
      setSelectedLanguages(AccountPreferenceData.language);
      setDefaultLanguage(AccountPreferenceData.default_language);
      setPaymentType(paymentTypeOptions);
      setOrderType(orderTypeOptions);
      setServiceFee(AccountPreferenceData?.serviceFee?.valueType);

      reset({
        paymentType: paymentTypeOptions,
        restaurant: AccountPreferenceData.restaurantType?.[0] || '',
        orderType: orderTypeOptions,
        tax: AccountPreferenceData.taxMode || '',
        serviceFeeRadio: AccountPreferenceData.serviceFee?.valueType || '',
        serviceFee: AccountPreferenceData.serviceFee?.value || 0,
        language: AccountPreferenceData.language || [],
        default_language: AccountPreferenceData.default_language || '',
        extras:
          AccountPreferenceData.tips?.map((tip: string) => ({ tip: tip })) ||
          [],
      });
    }
  }, [accountData]);

  const stripeStateButtonText = () => {
    if (
      connected?.stripeConnectStatus === STRIPE_CONNECT_STATUS.NOT_CONNECTED ||
      connected?.stripeConnectStatus === STRIPE_CONNECT_STATUS.LINK_CREATED
    ) {
      return t('account.preferenceTab.connectWithStripe');
    }
    if (
      connected?.stripeConnectStatus ===
      STRIPE_CONNECT_STATUS.CONNECTED_WITHOUT_APPROVED
    ) {
      return t('account.preferenceTab.completeStripeForm');
    }
  };

  const handleLanguagesChange = (value: string | string[]) => {
    if (Array.isArray(value)) {
      setSelectedLanguages(value);
    }
  };

  const { mutate } = useRestMutation(
    API_URL.resetCustomerOrderPassword,
    {
      method: API_METHODS.PUT,
    },
    {
      onSuccess: () => {
        toast.success(t('success.customerScreenPassword'));
      },
    },
  );

  // Check if organization is in Colombia with COP currency
  const showMercadoPago = userData?.country === 'CO' || userData?.currency?.code === 'COP';
  const showStripe = !showMercadoPago; // Hide Stripe for Colombia, show for others

  return (
    <>
      <div className="pb-5 flex flex-col gap-5">
        {/* Stripe Connection - Not visible for Colombia */}
        {showStripe && (
          <div className="flex gap-5 items-center">
            {connected?.stripeConnectStatus === STRIPE_CONNECT_STATUS.CONNECTED ? (
              <Paragraph variant="h5" weight="semibold" color="primary">
                {t('account.preferenceTab.connectedWithStripe')}
              </Paragraph>
            ) : (
              <PrimaryButton onClick={handleConnectWithStripe}>
                {loading ? (
                  <CircularProgress color="inherit" size={30} />
                ) : (
                  stripeStateButtonText()
                )}
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Mercado Pago Connection - Only for Colombia */}
        {showMercadoPago && (
          <div className="flex gap-5 items-center">
            {mpConnected.connected ? (
              <>
                <Paragraph variant="h5" weight="semibold" color="primary">
                  ✅ {t('account.preferenceTab.connectedWithMercadoPago') || 'Connected to Mercado Pago'}
                </Paragraph>
                <PrimaryButton onClick={handleOpenMpDashboard}>
                  {t('account.preferenceTab.openMpDashboard') || 'Open Mercado Pago Dashboard'}
                </PrimaryButton>
              </>
            ) : (
              <PrimaryButton onClick={handleConnectWithMercadoPago}>
                {mpLoading ? (
                  <CircularProgress color="inherit" size={30} />
                ) : (
                  t('account.preferenceTab.connectWithMercadoPago') || 'Connect with Mercado Pago'
                )}
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Reset Customer Password */}
        <div>
          <PrimaryButton onClick={() => mutate(undefined)}>
            {t('account.preferenceTab.resetCustomerOrderPassword')}
          </PrimaryButton>
        </div>
      </div>
      <GridContainer
        columns={getNumberOfCols({
          isDesktop,
          isMobile,
          desktopCol: 2,
          mobileCol: 1,
        })}
      >
        <Card title={t('account.preferenceTab.customerApplicationSettings')}>
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
          >
            <GridContainer columns={12}>
              <div
                data-item
                data-span={getNumberOfCols({
                  isDesktop,
                  isMobile,
                  desktopCol: 6,
                  mobileCol: 12,
                })}
              >
                <ControlledCheckbox
                  name="paymentType"
                  control={control}
                  options={paymentTypes}
                  selectedValues={paymentType}
                  align="horizontal"
                  label={t('account.preferenceTab.paymentType')}
                  handleChange={(val: ICheckbox[]) => setPaymentType(val)}
                />
              </div>
              <div
                data-item
                data-span={getNumberOfCols({
                  isDesktop,
                  isMobile,
                  desktopCol: 6,
                  mobileCol: 12,
                })}
              >
                <ControlledCheckbox
                  name="orderType"
                  control={control}
                  options={orderTypes}
                  selectedValues={orderType}
                  align="horizontal"
                  label={t('account.preferenceTab.orderType')}
                  handleChange={(val: ICheckbox[]) => setOrderType(val)}
                />
              </div>
              {userData?.businessType !== 'Hotels' ? (
                <div
                  data-item
                  data-span={getNumberOfCols({
                    isDesktop,
                    isMobile,
                    desktopCol: 6,
                    mobileCol: 12,
                  })}
                >
                  <ControlledRadio
                    align="horizontal"
                    label={t('account.preferenceTab.whatTypeRestaurant')}
                    name="restaurant"
                    control={control}
                    options={getRestaurantType}
                  />
                </div>
              ) : null}
              <div
                data-item
                data-span={getNumberOfCols({
                  isDesktop,
                  isMobile,
                  desktopCol: 6,
                  mobileCol: 12,
                })}
              >
                <ControlledRadio
                  align="horizontal"
                  label={t('account.preferenceTab.taxMode')}
                  name="tax"
                  control={control}
                  onChange={(val: ChangeEvent<HTMLInputElement>) =>
                    setTaxMode(val.target.value)
                  }
                  options={getTaxMode}
                />
              </div>
            </GridContainer>

            <Card title={t('account.preferenceTab.interfaceLangugageSettings')}>
              <GridContainer columns={12}>
                <div
                  data-item
                  data-span={getNumberOfCols({
                    isDesktop,
                    isMobile,
                    desktopCol: 6,
                    mobileCol: 12,
                  })}
                >
                  <ControlledDropdown
                    name="language"
                    control={control}
                    multiple
                    placeholder={t(
                      'account.preferenceTab.interfacelanguagesAvailable',
                    )}
                    options={languageOptions}
                    errors={errors}
                    helperText={errors}
                    value={selectedLanguages}
                    onChange={handleLanguagesChange}
                  />
                </div>
                <div
                  data-item
                  data-span={getNumberOfCols({
                    isDesktop,
                    isMobile,
                    desktopCol: 6,
                    mobileCol: 12,
                  })}
                >
                  <ControlledDropdown
                    name="default_language"
                    control={control}
                    placeholder={t('defaultLanguage')}
                    options={languageOptions}
                    errors={errors}
                    helperText={errors}
                    onChange={(e: string | string[]) =>
                      setDefaultLanguage(e as unknown as string)
                    }
                    value={defaultLanguage}
                  />
                </div>
              </GridContainer>
            </Card>

            <Card title={t('account.preferenceTab.tipsAndServiceFee')}>
              <GridContainer columns={12}>
                <div
                  data-item
                  data-span={getNumberOfCols({
                    isDesktop,
                    isMobile,
                    desktopCol: 6,
                    mobileCol: 12,
                  })}
                >
                  <ControlledRadio
                    align="horizontal"
                    label={t('account.preferenceTab.serviceFee')}
                    name="serviceFeeRadio"
                    control={control}
                    onChange={(val: ChangeEvent<HTMLInputElement>) =>
                      setServiceFee(val.target.value)
                    }
                    options={getServiceFee}
                  />
                  {serviceFee ? (
                    <ControlledInput
                      fullWidth
                      type="number"
                      name="serviceFee"
                      control={control}
                      required
                      errors={errors}
                      helperText={errors}
                    />
                  ) : null}
                </div>
                <div
                  data-item
                  data-span={getNumberOfCols({
                    isDesktop,
                    isMobile,
                    desktopCol: 6,
                    mobileCol: 12,
                  })}
                >
                  <Label variant="subtitle2" className="pb-4 block">
                    {t('account.preferenceTab.tip')}
                  </Label>
                  <GridContainer columns={2}>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        data-item
                        data-span={getNumberOfCols({
                          isDesktop,
                          isMobile,
                          desktopCol: 1,
                          mobileCol: 1,
                        })}
                      >
                        <div className="flex items-center">
                          <ControlledInput
                            type="number"
                            name={`extras[${index}].tip` as const}
                            control={control as unknown as Control<FieldValues>}
                            label={`${t('account.preferenceTab.tip')}${index + 1}`}
                            helperText={
                              errors.extras?.[index]?.tip
                                ?.message as unknown as FieldErrors
                            }
                            errors={errors}
                            fullWidth
                          />
                          <Iconbutton
                            iconColor="red"
                            name="delete"
                            onClick={() => remove(index)}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2' }}>
                      <PrimaryButton
                        onClick={() =>
                          append({
                            tip: 0,
                          })
                        }
                        size="small"
                        className="col-span-2"
                      >
                        {t('account.preferenceTab.addTip')}
                      </PrimaryButton>
                    </div>
                  </GridContainer>
                </div>
              </GridContainer>
            </Card>

            <div className="flex justify-end pt-5">
              <PrimaryButton
                disabled={!isDirty}
                type="submit"
                loading={updateAccountLoading}
              >
                {t('saveChanges')}
              </PrimaryButton>
            </div>
          </form>
        </Card>

        <div>
          <Bill />

          <div className="mt-5">
            <Theme />
          </div>
        </div>
      </GridContainer>
    </>
  );
};

export default AccountPreferences;
