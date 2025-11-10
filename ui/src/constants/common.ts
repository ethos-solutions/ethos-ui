import i18n, { t } from 'i18next';

export enum ROLES {
  ORGANISATION = 'ORGANISATION',
  EMPLOYEE = 'EMPLOYEE',
}

export enum PRODUCT_TYPE {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
}

export enum PRODUCT_VALUE {
  VEG = 'Vegeterian',
  NON_VEG = 'Non Vegetarian',
}

export const getProductType = () => [
  { value: PRODUCT_TYPE.VEG, label: i18n.t('vegeterian') },
  {
    value: PRODUCT_TYPE.NON_VEG,
    label: i18n.t('nonVeg'),
  },
];
export const getTransactionStatus = () => [
  { value: 'IN', label: i18n.t('transactionCode.in') },
  { value: 'OUT', label: i18n.t('transactionCode.out') },
];

export const getBusinessType = () => [
  { value: 'Hotels', label: i18n.t('auth.hotel') },
  { value: 'Restaurants', label: i18n.t('auth.restaurant') },
];

export const getTaxTypes = () => [
  { label: i18n.t('tax.element'), value: '1' },
  { label: i18n.t('tax.group'), value: '2' },
];

export const getOrderType = (businessType?: string) => {
  const options: { value: string; label: string }[] = [];

  if (businessType === 'Hotels') {
    options.push({
      value: 'RoomService',
      label: i18n.t('customer.roomService'),
    });
  } else {
    options.push({
      value: 'Takeaway',
      label: i18n.t('takeAway'),
    });
  }

  options.push({
    value: 'DineIn',
    label: i18n.t('dineIn'),
  });

  return options;
};

export const getPaymentType = () => [
  { label: i18n.t('online'), value: 'online' },
  { label: i18n.t('offline'), value: 'offline' },
];

export const employeeLoginUrl = '/auth/user/login';
export const loginUrl = '/login';
export const SUPPORTED_LANGUAGES = ['en-US', 'es', 'sv', 'fr'];

export const getLanguageOptions = () => [
  { label: i18n.t('languages.en-US'), value: 'en-US' },
  { label: i18n.t('languages.es'), value: 'es' },
  { label: i18n.t('languages.sv'), value: 'sv' },
  { label: i18n.t('languages.fr'), value: 'fr' },
];

export const getToppingsOptions = () => [
  { label: i18n.t('email'), value: 'email' },
  { label: i18n.t('sms'), value: 'sms' },
  { label: i18n.t('whatsapp'), value: 'whatsapp' },
  { label: i18n.t('notRequired'), value: 'not' },
];

export const getPaymentOptions = () => [
  {
    label: i18n.t('customer.onlinePayment'),
    value: 'online',
  },
  {
    label: i18n.t('customer.offlinePayment'),
    value: 'offline',
  },
];

export const getWastePercentage = () => [
  {
    label: i18n.t('receipeCard.wastePercentage'),
    value: 'waste-by-percentage',
  },
  { label: i18n.t('receipeCard.wasteQty'), value: 'waste-by-qty' },
];

export const getStatus = () => [
  { value: 'active', label: i18n.t('active') },
  { value: 'deleted', label: i18n.t('inactive') },
];

export const paymentType = () => [
  { label: i18n.t('cash'), value: 'cash' },
  { label: i18n.t('card'), value: 'card' },
];

export const productCategoryType = () => [
  { value: 'default', label: i18n.t('single') },
  {
    value: 'combo',
    label: i18n.t('combo'),
  },
];

export const productType = () => [
  { value: PRODUCT_TYPE.VEG, label: t('vegeterian') },
  {
    value: PRODUCT_TYPE.NON_VEG,
    label: t('nonVeg'),
  },
];

export const availableTimes = () => [
  {
    label: i18n.t('availableTime.allDay'),
    value: 'All_Day',
  },
  {
    label: i18n.t('availableTime.breakfast'),
    value: 'Breakfast',
  },
  {
    label: i18n.t('availableTime.lunch'),
    value: 'Lunch',
  },
  {
    label: i18n.t('availableTime.dinner'),
    value: 'Dinner',
  },
  {
    label: i18n.t('availableTime.snacks'),
    value: 'Snacks',
  },
];

export const comboType = () => [
  { value: 'Single', label: i18n.t('single') },
  { value: 'Multiple', label: i18n.t('multiple') },
];

export const restaurantType = () => [
  { label: i18n.t('restaurantType.pickUp'), value: 'fast_casual' },
  { label: i18n.t('dineIn'), value: 'full_service' },
];

export const restaurantTaxMode = () => [
  { value: 'included', label: i18n.t('account.preferenceTab.included') },
  { value: 'excluded', label: i18n.t('account.preferenceTab.excluded') },
];

export const restaurantServiceFee = () => [
  { value: 'Percentage', label: i18n.t('account.preferenceTab.percentage') },
  { value: 'Value', label: i18n.t('account.preferenceTab.flatRatio') },
];

// Colombian document types per DIAN
export const getDocumentTypes = () => [
  { value: '31', label: 'NIT - Solo Empresas', isCompany: true },
  { value: '13', label: i18n.t('documentTypes.cedulaCiudadania'), isCompany: false },
  { value: '21', label: i18n.t('documentTypes.tarjetaExtranjeria'), isCompany: false },
  { value: '22', label: i18n.t('documentTypes.cedulaExtranjeria'), isCompany: false },
  { value: '41', label: i18n.t('documentTypes.pasaporte'), isCompany: false },
  { value: '42', label: i18n.t('documentTypes.documentoExtranjero'), isCompany: false },
  { value: '47', label: i18n.t('documentTypes.pep'), isCompany: false },
  { value: '48', label: i18n.t('documentTypes.ppt'), isCompany: false },
];
