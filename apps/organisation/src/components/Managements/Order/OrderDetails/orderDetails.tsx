import { useMutation, useQuery } from '@apollo/client';
import { GET_ORDERS_DETAILS } from '../../../../api/queries/Orders';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../../Common';
import { GridContainer } from '@ethos-frontend/components';
import { getNumberOfCols, useResponsive } from '@ethos-frontend/utils';
import { OrderDetailsTable } from '../orderDetailsTable';
import { IOrderDetails } from '../payCounter';
import { OrderSummary } from '../orderSummary';
import { OrderHistory } from '../orderHistory';
import { useTranslation } from 'react-i18next';
import { ERROR_MESSAGES, ORDER_STATUS } from '@ethos-frontend/constants';
import { UPDATE_ORDER } from '@organisation/api/mutations/Order';
import { toast } from 'react-toastify';
import { PrimaryButton } from '@ethos-frontend/ui';
import { Alert, Chip } from '@mui/material';
import { Error, HourglassEmpty } from '@mui/icons-material';

export const DefaultOrderDetailsValues = {
  orderNo: '',
  tableNo: '',
  roomNo: '',
  createdAt: '',
  subTotal: 0,
  total: 0,
  serviceTax: 0,
  totalTax: 0,
  payment: '',
  type: '',
  smsPhone: '',
  phone: '',
  invoiceChoice: [],
  tip: 0,
  invoiceUrl: '',
  name: '',
  statusHistory: {
    date: '',
    status: '',
  },
  status: '',
  edocStatus: undefined,
  edocErrorMessage: undefined,
};
export const OrderDetails = () => {
  const { t } = useTranslation();
  const params = useParams();

  const { isDesktop, isMobile } = useResponsive();
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetailsData, setOrderDetailsData] = useState<IOrderDetails>(
    DefaultOrderDetailsValues,
  );

  const { data, refetch } = useQuery(GET_ORDERS_DETAILS, {
    variables: {
      orderId: params?.id,
    },
    fetchPolicy: 'no-cache',
    onCompleted: (res) => {
      const itemsData = res.order.data.items.map(
        (
          el: {
            extras: { groupName: string; products: { price: number }[] }[];
            comboProducts: {
              price: string | number;
              options: { price: number }[];
            }[];
            name: string;
            qty: number;
            discount: number;
            finalPrice: number;
            note: string;
          },
          i: number,
        ) => {
          const extrasTotalPrice = el.extras.reduce((total, group) => {
            return (
              total +
              group.products.reduce(
                (groupTotal, product) => groupTotal + product.price,
                0,
              )
            );
          }, 0);

          const comboProductsTotalPrice = el.comboProducts.reduce(
            (total, combo) => {
              const optionsTotalPrice = combo.options?.reduce(
                (optionsTotal, option) => optionsTotal + (option.price || 0),
                0,
              );
              return total + optionsTotalPrice;
            },
            0,
          );

          const totalFinalPrice =
            el.finalPrice + extrasTotalPrice + comboProductsTotalPrice;

          return {
            id: i + 1,
            name: el.name,
            qty: el.qty,
            discount: el.discount,
            price: totalFinalPrice,
            extras: el.extras,
            comboProducts: el.comboProducts,
            note: el.note,
          };
        },
      );

      setOrderItems(itemsData);
    },
  });

  useEffect(() => {
    if (data?.order) {
      setOrderDetailsData(data.order.data);
    }
  }, [data]);

  const nextStatusMap: Record<string, string> = {
    [ORDER_STATUS.RECEIVED]: ORDER_STATUS.PROGRESS,
    [ORDER_STATUS.PROGRESS]: ORDER_STATUS.READY,
    [ORDER_STATUS.READY]: ORDER_STATUS.COMPLETED,
  };
  const currentStatus = orderDetailsData.status;
  const nextStatus = currentStatus && nextStatusMap[currentStatus];

  const [updateOrder, { loading: updating }] = useMutation(UPDATE_ORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: GET_ORDERS_DETAILS,
        variables: { orderId: params?.id },
      },
    ],
  });

  const handleAdvance = () => {
    if (!nextStatus) return;
    updateOrder({
      variables: { data: { id: params?.id, status: nextStatus } },
    })
      .then(() => {
        toast.success(t('orderMoved', { next: t(nextStatus.toLowerCase()) }));
      })
      .catch(() => {
        toast.error(t(ERROR_MESSAGES.ORDER_STATUS));
      });
  };

  let buttonText = '';
  let color: 'primary' | 'warning' | 'success' = 'primary';
  switch (nextStatus) {
    case ORDER_STATUS.PROGRESS:
      buttonText = t('order.progress');
      color = 'warning';
      break;

    case ORDER_STATUS.READY:
      buttonText = t('order.markReady');
      color = 'success';
      break;

    case ORDER_STATUS.COMPLETED:
      buttonText = t('order.completeOrder');
      break;

    default:
  }

  const isEstado15 = orderDetailsData.edocStatus === '15';
  const isEstado20 = orderDetailsData.edocStatus === '20';

  return (
    <>
      <Header title={t('orderDetails')} />
      {(isEstado15 || isEstado20) && (
        <div className="mb-4">
          {isEstado15 && (
            <Alert severity="error" icon={<Error />}>
              <div className="font-semibold">{t('invoiceError')}</div>
              {orderDetailsData.edocErrorMessage && (
                <div className="text-sm mt-1">
                  {orderDetailsData.edocErrorMessage}
                </div>
              )}
            </Alert>
          )}
          {isEstado20 && (
            <Alert severity="warning" icon={<HourglassEmpty />}>
              <div className="font-semibold">{t('invoiceVerificationPending')}</div>
              <div className="text-sm mt-1">
                {t('verifying')}
              </div>
            </Alert>
          )}
        </div>
      )}
      {nextStatus && (
        <div className="mb-4">
          <PrimaryButton
            disabled={updating}
            onClick={handleAdvance}
            color={color}
            size="small"
          >
            {buttonText}
          </PrimaryButton>
        </div>
      )}
      <GridContainer columns={12}>
        <div
          date-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 7,
            mobileCol: 12,
          })}
        >
          <OrderDetailsTable
            orderDetailsData={orderDetailsData}
            orderItems={orderItems}
          />
        </div>
        <div
          date-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 5,
            mobileCol: 12,
          })}
          className="grid gap-4"
        >
          <GridContainer
            columns={getNumberOfCols({
              isDesktop,
              isMobile,
              desktopCol: 1,
              mobileCol: 2,
            })}
          >
            <OrderHistory
              orderDetailsData={orderDetailsData}
              refetch={refetch}
            />
            <OrderSummary orderDetailsData={orderDetailsData} />
          </GridContainer>
        </div>
      </GridContainer>
    </>
  );
};
