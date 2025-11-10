import { useMutation, useQuery } from '@apollo/client';
import { GET_ORDERS_DETAILS } from '@organisation/api/queries/Orders';
import styles from './order.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Label,
  Modal,
  Paragraph,
  PrimaryButton,
  Tabs,
  TextField,
} from '@ethos-frontend/ui';
import { useEffect, useState } from 'react';
import { getNumberOfCols, useResponsive } from '@ethos-frontend/utils';
import { Header } from '../../Common';
import { Card, GridContainer } from '@ethos-frontend/components';
import { TipForm } from './tipCouponModal';
import { Close } from '@mui/icons-material';
import { PAY_AT_COUNTER } from '@organisation/api/mutations/Order';
import { OrderDetailsTable } from './orderDetailsTable';
import { OrderSummary } from './orderSummary';
import { DefaultOrderDetailsValues } from './OrderDetails/orderDetails';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { SUCCESS_MESSAGES, SUCCESS_TEMPLATES } from '@ethos-frontend/constants';

export interface IStatusHistory {
  date: string;
  status: string;
}
export interface IOrderDetails {
  roomNo: any;
  orderNo: string;
  tableNo: string;
  createdAt: string;
  subTotal: number;
  total: number;
  serviceTax: number;
  totalTax: number;
  payment: string;
  type: string;
  smsPhone: string;
  phone: string;
  invoiceChoice: string[];
  tip: number;
  invoiceUrl: string;
  name: string;
  statusHistory: IStatusHistory;
  paymentType?: string;
  status?: string;
  edocStatus?: string;
  edocErrorMessage?: string;
}

export const PayCounter = () => {
  const {t} = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useResponsive();

  const [tabValue, setTabValue] = useState('1');
  const [paymentType, setPaymentType] = useState('cash');
  const [discount, setDiscount] = useState('');
  const [discountNote, setDiscountNote] = useState('');
  const [paid, setPaid] = useState(0);
  const [orderItems, setOrderItems] = useState<
    {
      id: number;
      name: string;
      qty: number;
      discount: number;
      finalPrice: number;
    }[]
  >([]);
  const [orderDetailsData, setOrderDetailsData] = useState<IOrderDetails>(
    DefaultOrderDetailsValues
  );
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery(GET_ORDERS_DETAILS, {
    variables: {
      orderId: params?.id,
    },
    onCompleted: (res) => {
      const itemsData = res.order.data.items.map(
        (
          el: {
            name: string;
            qty: number;
            discount: number;
            finalPrice: number;
            extras: any;
            comboProducts: any;
          },
          i: number
        ) => ({
          id: i + 1,
          name: el.name,
          qty: el.qty,
          discount: el.discount,
          price: el.finalPrice,
          extras: el.extras,
          comboProducts: el.comboProducts,
        })
      );
      setOrderItems(itemsData);
    },
  });

  const [payAtCounter, { loading }] = useMutation(PAY_AT_COUNTER, {
    onCompleted: () => {
      toast.success(t(SUCCESS_TEMPLATES.payment(orderDetailsData.orderNo)));
      navigate(-1);
    },
  });

  useEffect(() => {
    if (data?.order) {
      setOrderDetailsData(data.order.data);
    }
  }, [data]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setPaymentType(newValue === '1' ? 'cash' : 'card');
    setTabValue(newValue);
  };

  const handleSubmitForm = (data: {
    customDiscount: string;
    discountNote: string;
  }) => {
    setDiscount(data.customDiscount);
    setDiscountNote(data.discountNote);
    setShowModal(false);
  };

  const tipAmount = parseFloat(discount) || 0;

  const finalTotal =
    parseFloat((orderDetailsData?.total - tipAmount).toFixed(2)) || 0;

  const removeDiscount = () => {
    setDiscount('');
    setDiscountNote('');
  };

  const dueAmount =
    isNaN(paid) || paid === 0
      ? finalTotal // If paid is NaN or 0, set dueAmount to finalTotal
      : (paid - finalTotal).toFixed(2);

  const finalPaymentDetail = (
    <div className="grid gap-2">
      <div className={styles.info}>
        <Label variant="subtitle2" color="secondary">
          {t('order.subtotal')}
        </Label>
        <Paragraph variant="subtitle2">{orderDetailsData?.total}</Paragraph>
      </div>

      {discount ? (
        <div className={styles.info}>
          <Label variant="subtitle2" color="secondary">
          {t('order.discount')}
          </Label>

          <Paragraph
            onClick={removeDiscount}
            variant="subtitle2"
            className="flex items-center"
          >
            <PrimaryButton
              variant="text"
              color="error"
              size="small"
              startIcon={<Close />}
              className="!pr-5"
            >
              {t('order.removeDiscount')}
            </PrimaryButton>

            {tipAmount.toFixed(2)}
          </Paragraph>
        </div>
      ) : null}
      {discountNote ? (
        <>
          <Label variant="subtitle2" color="secondary">
            {t('order.discountNote')}
          </Label>
          <Paragraph variant="subtitle2">{discountNote}</Paragraph>
        </>
      ) : null}

      <div className={styles.info}>
        <Label variant="subtitle2" color="secondary" weight="bold">
          {t('total')}
        </Label>
        <Paragraph variant="subtitle2" weight="bold">
          {finalTotal}
        </Paragraph>
      </div>
    </div>
  );

  const handlePayAtCounter = () => {
    const body = {
      due: Number(dueAmount),
      orderId: params?.id,
      orderTotal: finalTotal,
      subTotal: orderDetailsData?.subTotal,
      paymentType,
      additionalDiscount: Number(discount),
      note: discountNote,
    };
    payAtCounter({ variables: { params: { ...body } } });
  };

  const tabs = [
    {
      label: t('order.payWithCash'),
      value: '1',
      panelContent: (
        <>
          {finalPaymentDetail}
          <div className={styles.input}>
            <TextField
              type="number"
              fullWidth
              label={t('paid')}
              onChange={(e) => {
                const value: number = parseFloat(e.target.value);
                setPaid(value);
              }}
              value={paid}
              inputProps={{
                step: 'any',
              }}
            />

            <TextField
              type="text"
              fullWidth
              label={t('order.due')}
              disabled
              value={dueAmount}
            />
          </div>
        </>
      ),
    },
    {
      label: t('order.creditDebit'),
      value: '2',
      panelContent: finalPaymentDetail,
    },
  ];

  return (
    <div className={styles.accountWrap}>
      <Header title={t('order.payAtCounter')} />
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
            setShowModal={setShowModal}
            showButton
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
          <OrderSummary orderDetailsData={orderDetailsData} />
          <Card title={t('order.paymentMethod')}>
            <Tabs value={tabValue} onChange={handleChange} tabs={tabs} />
            <PrimaryButton
              disabled={tabValue === '1' && (isNaN(paid) || paid < finalTotal)}
              className="!mt-5"
              onClick={handlePayAtCounter}
              loading={loading}
            >
              {t('order.payNow')}
            </PrimaryButton>
          </Card>
        </div>
      </GridContainer>

      <Modal
        open={showModal}
        title={t('order.addDiscount')}
        size="md"
        onClose={() => setShowModal(false)}
      >
        <TipForm
          handleClose={() => setShowModal(false)}
          handleSubmitForm={handleSubmitForm}
          maxDiscount={orderDetailsData?.total || 0}
        />
      </Modal>
    </div>
  );
};
