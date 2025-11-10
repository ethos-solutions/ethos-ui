import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { Heading } from '@ethos-frontend/ui';
import { useTranslation } from 'react-i18next';
import { getStorage } from '@ethos-frontend/utils';

interface PaymentBricksProps {
  organisationId: string;
  orderId: string;
  amount: number;
  description: string;
  onSuccess: (payment: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

// Declare MercadoPago types for TypeScript
declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const PaymentBricks: React.FC<PaymentBricksProps> = ({
  organisationId,
  orderId,
  amount,
  description,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [paymentBrick, setPaymentBrick] = useState<any>(null);

  // Load Mercado Pago SDK from CDN
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    const loadMercadoPagoSDK = () => {
      if (window.MercadoPago) {
        setMpLoaded(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://sdk.mercadopago.com/js/v2"]',
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setTimeout(() => {
            if (window.MercadoPago) {
              setMpLoaded(true);
            } else {
              onError(new Error('MercadoPago SDK loaded but not accessible'));
            }
          }, 500);
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = false;
      script.defer = false;
      script.onload = () => {
        setTimeout(() => {
          if (window.MercadoPago) {
            setMpLoaded(true);
          } else {
            onError(new Error('MercadoPago SDK loaded but not accessible'));
          }
        }, 500);
      };
      script.onerror = () => {
        onError(new Error('Failed to load payment system'));
      };

      document.head.appendChild(script);
    };

    loadMercadoPagoSDK();
  }, [onError]);

  // Initialize Payment Brick when SDK is loaded
  useEffect(() => {
    if (mpLoaded && window.MercadoPago && amount > 0) {
      initializePaymentBrick();
    }
  }, [mpLoaded, amount, organisationId]);

  const initializePaymentBrick = async () => {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!window.MercadoPago) {
        throw new Error('MercadoPago SDK not loaded');
      }

      const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
      const isConstructor = typeof window.MercadoPago === 'function';

      let mp;

      // Try as constructor first (official pattern for v2)
      if (isConstructor) {
        try {
          mp = new window.MercadoPago(publicKey, {
            locale: 'es-CO',
          });
        } catch (_error) {
          // Try alternative initialization methods
        }
      }

      // If constructor fails, try alternative methods
      if (!mp) {
        if (typeof window.MercadoPago.instances === 'object') {
          mp = window.MercadoPago.instances;
        } else if (typeof window.MercadoPago.create === 'function') {
          mp = window.MercadoPago.create(publicKey, { locale: 'es-CO' });
        } else if (typeof window.MercadoPago.init === 'function') {
          mp = window.MercadoPago.init(publicKey, { locale: 'es-CO' });
        } else {
          if (typeof window.MercadoPago.setPublicKey === 'function') {
            window.MercadoPago.setPublicKey(publicKey);
          }
          mp = window.MercadoPago;
        }
      }

      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }

      // Get bricks builder
      let bricksBuilder;
      if (typeof mp.bricks === 'function') {
        bricksBuilder = mp.bricks();
      } else if (mp.bricks && typeof mp.bricks === 'object') {
        bricksBuilder = mp.bricks;
      } else {
        throw new Error('Cannot access MercadoPago bricks');
      }

      // Clear existing brick
      const container = document.getElementById('payment-brick-container');
      if (container) {
        container.innerHTML = '';
      }

      // Get user email from session storage to pre-fill the form
      let userEmail = '';
      try {
        const email = getStorage('email');
        if (email) {
          userEmail = email || ''
        }
      } catch (_error) {
        // Could not retrieve email
      }

      // Payment Brick configuration
      const settings = {
        initialization: {
          amount: amount,
          payer: {
            email: userEmail || '', // Pre-fill email from session storage
          },
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all', // For cash payments like Efecty, Baloto
            bankTransfer: 'all',
            onboarding_credits: 'all',
            wallet_purchase: 'all',
            maxInstallments: 1,
          },
          visual: {
            style: {
              theme: 'default',
            },
          },
        },
        callbacks: {
          onReady: () => {
            // Payment Brick is ready
          },
          onSubmit: async (paymentData: any) => {
            console.log(paymentData, 'Payment data received from Brick');
            return await handlePaymentSubmit(paymentData);
          },
          onError: (error: any) => {
            console.error('Payment Brick error:', error);
            onError(error);
          },
        },
      };

      // Create Payment Brick
      const paymentBrickController = await bricksBuilder.create(
        'payment',
        'payment-brick-container',
        settings,
      );

      setPaymentBrick(paymentBrickController);
    } catch (error) {
      console.error('Error initializing Payment Brick:', error);
      onError(error);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setLoading(true);
    const { formData } = paymentData;
    try {
      // Prepare payment payload for backend
      const paymentPayload: any = {
        organisationId,
        orderId,
        token: formData.token,
        transactionAmount: amount,
        description,
        installments: formData.installments || 1,
        paymentMethodId: formData.payment_method_id,
        payer: {
          email: formData.payer?.email || '',
          identification: {
            type: formData.payer?.identification?.type || 'CC',
            number: formData.payer?.identification?.number || '',
          },
        },
      };

      // Handle name fields - Payment Brick might not collect them
      // For Mercado Pago Colombia TEST: If no name provided, don't send name fields at all
      // The backend will handle test names if needed
      if (formData.payer?.first_name && formData.payer.first_name.trim()) {
        paymentPayload.payer.first_name = formData.payer.first_name.trim();
      }
      if (formData.payer?.last_name && formData.payer.last_name.trim()) {
        paymentPayload.payer.last_name = formData.payer.last_name.trim();
      }
      
      // Don't send empty name fields - let backend handle defaults for TEST mode
      if (paymentPayload.payer.first_name === '') {
        delete paymentPayload.payer.first_name;
      }
      if (paymentPayload.payer.last_name === '') {
        delete paymentPayload.payer.last_name;
      }
      
      // Additional data that might be provided by Payment Brick
      if (formData.issuer_id) {
        paymentPayload.issuer_id = formData.issuer_id;
      }
      if (formData.payment_type_id) {
        paymentPayload.payment_type_id = formData.payment_type_id;
      }

      // Get the authentication token from sessionStorage (encrypted)
      const token = getStorage('accessToken');

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/organisation/payments/mp/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentPayload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment processing failed');
      }

      // Check payment status from backend response
      const paymentStatus = result.status;
      
      if (paymentStatus === 'approved') {
        // Payment approved - order is confirmed
        onSuccess(result);
        return {
          status: 'success',
          message: 'Payment approved successfully',
        };
      } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
        // Payment is pending review - show pending message
        toast.warning('Payment is being reviewed. You will be notified once approved.');
        onSuccess({ ...result, isPending: true });
        return {
          status: 'pending',
          message: 'Payment is being reviewed',
        };
      } else {
        // Payment failed or rejected
        throw new Error('Payment was not approved. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);

      // Show error to user
      toast.error(error.message || 'Payment failed. Please try again.');
      onError(error);

      // Return error to Payment Brick
      return {
        status: 'error',
        message: error.message || 'Payment failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Cleanup Payment Brick on unmount
  useEffect(() => {
    return () => {
      if (paymentBrick) {
        try {
          paymentBrick.unmount();
        } catch (error) {
          console.warn('Error unmounting Payment Brick:', error);
        }
      }
    };
  }, [paymentBrick]);

  return (
    <div className="payment-bricks-container max-w-2xl mx-auto px-2 sm:px-4">
      <div className="flex justify-between items-center">
        <Heading
          variant="h5"
          weight="semibold"
          className="pb-3 sm:pb-4 text-center sm:text-left"
        >
          {t('customer.paymentDetails')}
        </Heading>

        {/* Cancel Button */}
        {onCancel && (
          <div className="flex justify-center pt-3 sm:pt-4 pb-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              disabled={loading}
            >
              {t('cancel') || 'Cancel Payment'}
            </button>
          </div>
        )}
      </div>
      {/* Order Summary */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="font-medium text-gray-700 text-sm sm:text-base">
            Total Amount:
          </span>
          <span className="font-bold text-lg sm:text-xl text-gray-900">
            ${amount.toLocaleString()} COP
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mt-2">
          Order: {orderId}
        </div>
        <div className="text-xs sm:text-sm text-gray-600 break-words">
          {description}
        </div>
      </div>

      {/* Payment Brick Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
        <div
          id="payment-brick-container"
          className="min-h-[300px] sm:min-h-[400px]"
        >
          {!mpLoaded && (
            <div className="flex items-center justify-center h-32">
              <CircularProgress size={24} className="mr-3" />
              <span className="text-gray-600 text-sm sm:text-base">
                Loading payment form...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg flex items-center shadow-xl mx-4">
            <CircularProgress size={20} className="mr-3" />
            <span className="text-gray-700 text-sm sm:text-base">
              Processing payment...
            </span>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 mt-3 sm:mt-4 pb-2">
        <p className="mb-1">
          🔒 Your payment information is secure and encrypted
        </p>
        <p className="text-gray-400">Powered by Mercado Pago</p>
      </div>
    </div>
  );
};
