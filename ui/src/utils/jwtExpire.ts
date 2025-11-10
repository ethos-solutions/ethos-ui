import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export const handleJwtExpiration = (token: string | null): boolean => {
  if (typeof window === 'undefined') {
    return true; // During SSR, assume token is valid
  }

  let isTokenValid = true;

  if (token) {
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        isTokenValid = false;
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.info('Your session has expired. Please login again!');
      }
    } catch (error) {
      isTokenValid = false;
      window.location.href = '/login';
      localStorage.removeItem('token');
    }
  }

  return isTokenValid;
};
