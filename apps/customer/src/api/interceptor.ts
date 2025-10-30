import axios from 'axios';
import { getStorage, handleCustomerExpiredToken, isCustomerTokenExpired } from '@ethos-frontend/utils';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (isCustomerTokenExpired()) {
      handleCustomerExpiredToken();
      return config;
    }

    const token = getStorage('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      handleCustomerExpiredToken();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;