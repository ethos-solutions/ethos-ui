import { useMutation, useQuery } from '@apollo/client';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { GET_ORDERS_LIST } from '@organisation/api/queries/Orders';
import { UPDATE_ORDER } from '@organisation/api/mutations/Order';
import { PrimaryButton, Tabs, TextField } from '@ethos-frontend/ui';
import { GridSortItem, GridSortModel } from '@mui/x-data-grid-premium';
import { Link, useLocation } from 'react-router-dom';
import { ExportReportModal, Header } from '../../../Common';
import { useSocket } from '../../../../context/socket';
import { toast } from 'react-toastify';
import { OrderTable } from './orderTable';
import { DownloadForOfflineOutlined, Search } from '@mui/icons-material';
import { debounce } from '../../../../commonUtils/CommonUtils';
import {
  API_URL,
  ERROR_MESSAGES,
  ORDER_STATUS,
  SUCCESS_MESSAGES,
} from '@ethos-frontend/constants';
import { useRestQuery } from '@ethos-frontend/hook';
import { useUser } from '../../../../context/user';
import { useTranslation } from 'react-i18next';

export interface IOrder {
  id: string;
  orderNo: string;
  name: string;
  payment?: string;
  type: string;
  total: string;
  tableNo: string;
  roomNo?: string;
  items?: string;
  invoiceUrl?: string;
  paymentType?: string;
  _id?: string;
  status?: string;
  productItems?: any;
  edocNeedsVerification?: boolean;
}

const transformData = (order: any): IOrder => ({
  id: order._id,
  orderNo: order.orderNo,
  name: order.name,
  payment: order.payment,
  type: order.type,
  status: order.status,
  total: order.total,
  tableNo: order.tableNo,
  roomNo: order.roomNo ?? 0,
  items: order?.items?.length,
  invoiceUrl: order.invoiceUrl,
  paymentType: order.paymentType,
  edocNeedsVerification: order.edocNeedsVerification,
});

export const OrderList = ({ permissions }: { permissions?: string[] }) => {
  const params = useLocation();
  const { userData } = useUser();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [totalItems, setTotalItems] = useState(0);
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState({
    limit: 10,
    pageNo: 1,
  });
  const [sortUser, setSortUser] = useState<GridSortItem[]>([]);
  const [rows, setRows] = useState<IOrder[]>([]);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [searchTableNUmber, setSearchTableNumber] = useState('');
  const [openExportModal, setOpenExportModal] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [start, end] = dateRange;
  const startTs = start ? new Date(start).setHours(0, 0, 0, 0) : '';
  const endTs = end ? new Date(end).setHours(23, 59, 59, 999) : '';

  const status = useMemo(() => {
    switch (params.pathname) {
      case '/orders/progress':
        return ORDER_STATUS.PROGRESS;
      case '/orders/ready':
        return ORDER_STATUS.READY;
      case '/orders/cancelled':
        // Cancelled tab shows both CANCELLED and REFUNDED orders
        return ORDER_STATUS.CANCELLED;
      case '/orders/completed':
        return ORDER_STATUS.COMPLETED;
      default:
        return ORDER_STATUS.RECEIVED;
    }
  }, [params.pathname]);

  const variables = useMemo(
    () => ({
      params: {
        limit: page.limit,
        pageNo: page.pageNo,
        status: [status],
        searchKey,
        sortBy: sortUser[0]?.field || null,
        sortOrder: sortUser[0]?.sort === 'asc' ? 1 : -1,
        ...(userData?.businessType === 'Hotels'
          ? { roomNo: searchTableNUmber }
          : { tableNo: searchTableNUmber }),
      },
    }),
    [page.limit, page.pageNo, status, searchKey, sortUser, searchTableNUmber],
  );

  const { data, loading, refetch } = useQuery(GET_ORDERS_LIST, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const [updateOrder] = useMutation(UPDATE_ORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: GET_ORDERS_LIST,
        variables,
      },
    ],
  });

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: string) => {
        const newOrder = JSON.parse(message);
        if (
          newOrder.status === ORDER_STATUS.RECEIVED &&
          params.pathname === '/orders/received'
        ) {
          addNewOrderToTable(newOrder);
        }
      });

      return () => {
        socket.off('message');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (data?.orders) {
      setTotalItems(data.orders.totalItems);
      setRows(data.orders.data.map(transformData));
    }
  }, [data]);

  const addNewOrderToTable = (newOrder: any) => {
    const order = transformData(newOrder);
    setHighlightedRowId(order.id);
    setRows((prevRows) => [order, ...prevRows]);
    setTimeout(() => {
      setHighlightedRowId(null);
    }, 3000);
  };

  const handleChange = () => {
    setPage({ limit: 10, pageNo: 1 });
  };

  const handleUpdateOrder = (order: {
    status: string;
    id: string;
    orderNo: string;
    name: string;
  }) => {
    let newStatus;
    switch (order.status) {
      case ORDER_STATUS.RECEIVED:
        newStatus = ORDER_STATUS.PROGRESS;
        break;
      case ORDER_STATUS.PROGRESS:
        newStatus = ORDER_STATUS.READY;
        break;
      case ORDER_STATUS.READY:
        newStatus = ORDER_STATUS.COMPLETED;
        break;
    }
    if (!newStatus) return;

    setRows((prev) => prev.filter((r) => r.id !== order.id));
    setTotalItems((t) => t - 1);

    updateOrder({
      variables: { data: { id: order.id, status: newStatus } },
    })
      .then((res) => {
        const statusTextMap: Record<string, string> = {
          [ORDER_STATUS.PROGRESS]: 'in progress',
          [ORDER_STATUS.READY]: 'ready',
          [ORDER_STATUS.COMPLETED]: 'completed',
        };
        const statusText = statusTextMap[res.data.updateOrder.data.status];
        toast.success(
          `${order.name || order.orderNo} has been moved to ${statusText}`,
        );
        refetch();
      })
      .catch(() => {
        toast.error(t(ERROR_MESSAGES.ORDER_STATUS));
      });
  };

  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKey(e.target.value);
    setPage({ limit: 10, pageNo: 1 });
  };

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortUser([...newSortModel]);
  };

  const handleSearchTableNumber = debounce((e) => {
    setSearchTableNumber((e as ChangeEvent<HTMLInputElement>)?.target?.value);
    setPage({ limit: 10, pageNo: 1 });
  }, 500);

  const { refetch: exportOrderQuery, isFetching } = useRestQuery(
    ['export-order-report'],
    `${API_URL.exportOrderReport}?startDate=${startTs}&endDate=${endTs}`,
    {
      enabled: false,
      onSuccess: (response: any) => {
        const fileUrl = response.data;
        const link = document.createElement('a');
        link.href = fileUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t(SUCCESS_MESSAGES.ORDER_REPORT_DOWNLOAD));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );

  const tabs = [
    {
      label: t('received'),
      value: '/orders/received',
      component: Link,
      to: '/orders/received',
      panelContent: (
        <OrderTable
          handleUpdateOrder={handleUpdateOrder}
          rows={rows}
          page={page}
          setPage={setPage}
          totalItems={totalItems}
          sortUser={sortUser}
          handleSortModelChange={handleSortModelChange}
          highlightedRowId={highlightedRowId}
          loading={loading}
          permissions={permissions}
        />
      ),
    },
    {
      label: t('progress'),
      value: '/orders/progress',
      component: Link,
      to: '/orders/progress',
      panelContent: (
        <OrderTable
          handleUpdateOrder={handleUpdateOrder}
          rows={rows}
          page={page}
          setPage={setPage}
          totalItems={totalItems}
          sortUser={sortUser}
          handleSortModelChange={handleSortModelChange}
          loading={loading}
          permissions={permissions}
        />
      ),
    },
    {
      label: t('ready'),
      value: '/orders/ready',
      component: Link,
      to: '/orders/ready',
      panelContent: (
        <OrderTable
          handleUpdateOrder={handleUpdateOrder}
          rows={rows}
          page={page}
          setPage={setPage}
          totalItems={totalItems}
          sortUser={sortUser}
          handleSortModelChange={handleSortModelChange}
          loading={loading}
          permissions={permissions}
        />
      ),
    },
    {
      label: t('completed'),
      value: '/orders/completed',
      component: Link,
      to: '/orders/completed',
      panelContent: (
        <OrderTable
          handleUpdateOrder={handleUpdateOrder}
          rows={rows}
          page={page}
          setPage={setPage}
          totalItems={totalItems}
          sortUser={sortUser}
          handleSortModelChange={handleSortModelChange}
          loading={loading}
          permissions={permissions}
        />
      ),
    },
    {
      label: t('cancelled'),
      value: '/orders/cancelled',
      component: Link,
      to: '/orders/cancelled',
      panelContent: (
        <OrderTable
          handleUpdateOrder={handleUpdateOrder}
          rows={rows}
          page={page}
          setPage={setPage}
          totalItems={totalItems}
          sortUser={sortUser}
          handleSortModelChange={handleSortModelChange}
          loading={loading}
          permissions={permissions}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between gap-4 items-start">
        <Header title={t('order.title')} handleChange={onSearchHandler} />
        <TextField
          placeholder={
            userData?.businessType === 'Hotels'
              ? t('order.roomNumber')
              : t('order.tableNumber')
          }
          label={
            userData?.businessType === 'Hotels'
              ? t('order.roomNumber')
              : t('order.tableNumber')
          }
          leftIcon={<Search />}
          onChange={handleSearchTableNumber}
        />
        <PrimaryButton
          startIcon={<DownloadForOfflineOutlined />}
          variant="outlined"
          onClick={() => setOpenExportModal(true)}
        >
          {t('order.exportOrders')}
        </PrimaryButton>
      </div>
      <Tabs value={params.pathname} onChange={handleChange} tabs={tabs} />
      <ExportReportModal
        title={t('order.exportOrdersReports')}
        open={openExportModal}
        onClose={() => setOpenExportModal(false)}
        onSubmit={exportOrderQuery}
        dateRange={[start, end]}
        setDateRange={setDateRange}
        loading={isFetching}
      />
    </>
  );
};
