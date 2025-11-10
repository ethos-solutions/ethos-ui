import { AppProps } from 'next/app';
import Head from 'next/head';
import './global.scss';
import { EOThemeProvider } from '@ethos-frontend/ui';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, StyledEngineProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-multi-carousel/lib/styles.css';
import { CartProvider } from '../context/cart';
import { Suspense, useEffect, useState, startTransition } from 'react';
import { DEFAULT_COLOR, themeColors } from '@ethos-frontend/constants';
import ApolloWrapper from '@ethos-frontend/apollo';
import {
  generateSessionKey,
  getCookie,
  getStorage,
  setCookie,
} from '@ethos-frontend/utils';
import { useRouter } from 'next/router';
import i18n from '@ethos-frontend/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
    },
  },
});

function CustomApp({ Component, pageProps }: AppProps) {
  const [colorCode, setColorCode] = useState<string>(DEFAULT_COLOR);
  const getThemeColors = themeColors();
  const router = useRouter();

  useEffect(() => {
    const existingKey = getCookie('sessionKey');
    if (!existingKey) {
      const sessionKey = generateSessionKey();
      setCookie('sessionKey', sessionKey, {
        secure: true,
        sameSite: 'Strict',
      });
    }
  }, []);

  useEffect(() => {
    if (router.locale) {
      i18n.changeLanguage(router.locale);
    }
  }, [router.locale]);

  useEffect(() => {
    const updateThemeFromSession = async () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      
      const { colorCode: defaultColor } = JSON.parse(
        getStorage('restaurantData') || '{}',
      );

      const theme = getThemeColors.find((theme) => theme.name === defaultColor);
      startTransition(() => {
        setColorCode(theme?.code || DEFAULT_COLOR);

        document.body.style.backgroundColor = theme?.background || '#fff';
        document.body.style.backgroundImage = `url(${
          theme?.image ||
          'https://app-background.s3.us-east-1.amazonaws.com/BG+1.webp'
        })`;
        document.documentElement.style.setProperty(
          '--primary-color',
          theme?.code || DEFAULT_COLOR,
        );
        document.body.style.backgroundSize = '100% 100%';
        document.body.style.backgroundRepeat = 'no-repeat';
      });
    };

    updateThemeFromSession();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storageUpdate', updateThemeFromSession);
      return () => {
        window.removeEventListener('storageUpdate', updateThemeFromSession);
      };
    }
  }, [colorCode]);

  const theme = createTheme({
    palette: {
      primary: {
        main: colorCode,
        dark: '#3F3F3F',
      },
      secondary: {
        main: colorCode,
        dark: '#3F3F3F',
      },
      action: {
        disabled: '#fff',
      },
    },
  });

  return (
    <>
      <Head>
        <title>Ethos Orders</title>
      </Head>
      <main className="app">
        <ToastContainer />
        <StyledEngineProvider injectFirst>
          <ApolloWrapper isNextApp>
            <Suspense fallback={<p>...</p>}>
              <QueryClientProvider client={queryClient}>
                <EOThemeProvider customTheme={theme}>
                  <CartProvider>
                    <Component {...pageProps} />
                  </CartProvider>
                </EOThemeProvider>
              </QueryClientProvider>
            </Suspense>
          </ApolloWrapper>
        </StyledEngineProvider>
      </main>
    </>
  );
}

export default CustomApp;
