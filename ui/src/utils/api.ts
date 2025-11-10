import axios, { AxiosRequestConfig } from 'axios';
import { handleJwtExpiration } from '../utils/jwtExpire';
import { getStorage } from './common';

const API_BASE_URL =
  typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']
    ? process.env['NEXT_PUBLIC_API_URL']
    : import.meta.env['VITE_APP_API_URL'];

export const getAuthHeaders = (): Record<string, string> => {
  const token =
    typeof process !== 'undefined' && process.env['NEXT_PUBLIC_API_URL']
      ? getStorage('accessToken')
      : localStorage.getItem('token');
  const isTokenValid = handleJwtExpiration(token);
  return isTokenValid && token ? { Authorization: `Bearer ${token}` } : {};
};

export const getLangHeader = (
  moduleLanguage: Record<string, string>,
): string => {
  if (typeof window === 'undefined') {
    return 'en-US';
  }
  
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const baseRoute = `/${pathSegments[0]}`;
  return moduleLanguage[baseRoute] || localStorage.getItem('i18nextLng') || 'en-US';
};

export const createAxiosInstance = (moduleLang: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: { lang: moduleLang, ...getAuthHeaders() },
  });
};

export const apiFetcher = async (
  url: string,
  config: AxiosRequestConfig = {},
  moduleLang: string,
) => {
  const axiosInstance = createAxiosInstance(moduleLang);
  const response = await axiosInstance.get(url, config);
  return response.data;
};
