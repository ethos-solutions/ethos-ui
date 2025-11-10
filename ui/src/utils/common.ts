import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/system';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { getLanguageOptions } from '@ethos-frontend/constants';
import { enUS, es, sv } from 'date-fns/locale';
dayjs.extend(utc);

interface ApiResponse {
  data?: {
    accessToken?: string;
    adminId?: string;
  };
}

export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};

export const getNumberOfCols = ({
  isMobile,
  isDesktop,
  mobileCol,
  desktopCol,
}: {
  isMobile?: boolean;
  isDesktop?: boolean;
  mobileCol?: number;
  desktopCol?: number;
}) => {
  if (isMobile) return mobileCol || 12;
  if (isDesktop) return desktopCol || 3;
  return mobileCol || 4;
};

export const formatDateTime = (timestamp: string): string => {
  return dayjs(parseFloat(timestamp)).format('MM-DD-YYYY h:mm A');
};

export const dateFormatInUtc = (date: string): string => {
  return dayjs.utc(date).format('MM-DD-YYYY h:mm A');
};

export const getCurrencySymbol = (currency: string) => {
  const startIndex = currency?.indexOf('(') + 1;
  const endIndex = currency?.indexOf(')');

  if (startIndex && endIndex) {
    return currency?.substring(startIndex, endIndex);
  }
  return currency;
};

export const getLanguageLabel = (value: string | undefined) => {
  return (
    getLanguageOptions().find((option) => option.value === value)?.label ||
    value
  );
};

export const handleSuccess = (
  res: ApiResponse,
  successMessage: string,
  navigate: NavigateFunction,
  redirectPath = '/',
) => {
  toast.success(successMessage);
  const data = res.data;
  const accessToken = data?.accessToken;
  if (accessToken) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('id', data?.adminId || '');
  }
  navigate(redirectPath);
};

export const handleError = (err: AxiosError) => {
  const errorData = err?.response?.data as {
    message?: string;
    [key: string]: any;
  };
  const errorMessage = errorData?.message || 'An error occurred';

  const errorMessages: Record<string, string> = {
    Forbidden: 'Access denied. Please check your credentials and try again.',
    'Invalid password':
      'The password you entered is incorrect. Please try again.',
    'Email not found':
      'The email you entered is not registered. Please check and try again.',
  };

  toast.error(
    errorMessages[errorMessage] ||
      'An unexpected error occurred. Please try again later.',
  );
};

export const isCustomerTokenExpired = (): boolean => {
  const token = getStorage('accessToken');

  if (!token) {
    return true;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const handleCustomerExpiredToken = () => {
  if (typeof window === 'undefined') return;
  
  const orgId = getStorage('orgId');
  window.location.href = `/${orgId}`;
};

export const generateSessionKey = () => {
  if (typeof window === 'undefined' || typeof window.crypto === 'undefined') {
    // Fallback for SSR - generate a simple random string
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  const array = new Uint8Array(256);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};

export const encryptData = (data: string) => {
  return data;
  const sessionKey = getCookie('sessionKey') || '';
  if (!data) return null;

  return CryptoJS.AES.encrypt(JSON.stringify(data), sessionKey).toString();
};

export const decryptData = (cipherText: string) => {
  return cipherText;
  const sessionKey = getCookie('sessionKey') || '';
  try {
    if (!cipherText || !sessionKey) return null;
    const bytes = CryptoJS.AES.decrypt(cipherText, sessionKey);
    const decryptedData = bytes?.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) return null;
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const setStorage = (name: string, value: string) => {
  if (typeof window !== 'undefined') {
    const encryptedValue = encryptData(value);
    sessionStorage.setItem(name, encryptedValue as string);
    if (typeof window !== 'undefined' && typeof Event !== 'undefined') {
      const event = new Event('storageUpdate');
      window.dispatchEvent(event);
    }
  }
  return null;
};

export const getStorage = (name: string) => {
  if (typeof window !== 'undefined') {
    const encryptedValue = sessionStorage.getItem(name);
    return encryptedValue ? decryptData(encryptedValue) : null;
  }
  return null;
};

export const removeStorage = (name: string) => {
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    return sessionStorage.removeItem(name);
  }
  return null;
};

export const useIsMobile = () => {
  const isMobile = useMediaQuery('(max-width:767px)');
  return isMobile;
};

export const setCookie = (
  name: string,
  value: string,
  options?: Record<string, unknown>,
) => {
  return Cookies.set(name, value, { ...options });
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const priceWithSymbol = (price: number) => {
  if (typeof window !== 'undefined') {
    const { currency } = JSON.parse(getStorage('restaurantData') || '{}');

    const symbol = getCurrencySymbol(currency.symbol);
    return `${symbol}${price}`;
  }
  return `$${price}`;
};

export const priceWithSymbolAdmin = (
  price: number | string | undefined | null,
  currency?: { symbol: string; code: string },
) => {
  const numericPrice = Number(price);
  const formattedPrice = isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);

  if (typeof window !== 'undefined') {
    const symbol = getCurrencySymbol(currency?.symbol as string);
    return `${symbol}${formattedPrice}`;
  }

  return `$${formattedPrice}`;
};

export const getFormattedTimestamp = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const year = now.getFullYear();

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hourStr = pad(hours);
  const minuteStr = pad(now.getMinutes());

  const FW_SLASH = '\uFF0F';
  const FW_COLON = '\uFF1A';

  return (
    `${month}${FW_SLASH}${day}${FW_SLASH}${year} ` +
    `${hourStr}${FW_COLON}${minuteStr}${ampm}`
  );
};

export const locales: Record<string, Locale> = {
  'en-US': enUS,
  es: es,
  sv: sv,
};
