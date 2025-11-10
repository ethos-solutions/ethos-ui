import {
  Chip,
  Iconbutton,
  Label,
  PrimaryButton,
  Table,
  Dailog,
} from '@ethos-frontend/ui';
import { ArrowForwardIos, ReceiptOutlined } from '@mui/icons-material';
import {
  GridColDef,
  GridRenderCellParams,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid-premium';
import { Link, NavigateOptions, To, useNavigate } from 'react-router-dom';
import { IOrder } from './orderList';
import styles from '../order.module.scss';
import React, { Dispatch, SetStateAction } from 'react';
import { ERROR_MESSAGES, ORDER_STATUS } from '@ethos-frontend/constants';
import { useMutation } from '@apollo/client';
import { UPDATE_ORDER } from '@organisation/api/mutations/Order';
import { toast } from 'react-toastify';
import { GET_ORDERS_LIST } from '@organisation/api/queries/Orders';
import { useUser } from '../../../../context/user';
import { t } from 'i18next';

const columns = (
  handleUpdateOrder: {
    (order: {
      status: string;
      id: string;
      orderNo: string;
      name: string;
    }): void;
  },
  navigate?: (to: To, options?: NavigateOptions) => void,
  rows?: IOrder[],
  setSelectedOrderId?: React.Dispatch<React.SetStateAction<string | null>>,
  setDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  businessType?: string,
  permissions?: string[],
) => {
  const isHotel = businessType === 'Hotels';

  const hasCompletedOrder = rows?.some(
    (row) => row.status === ORDER_STATUS.COMPLETED,
  );

  const hasCancelledOrder = rows?.some(
    (row) => row.status === ORDER_STATUS.CANCELLED,
  );

  const hasRefundedOrder = rows?.some(
    (row) => row.status === ORDER_STATUS.REFUNDED,
  );

  const commonColumns = [
    {
      field: 'orderNo',
      headerName: t('tableData.orderId'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const order = params.row.id;
        const isEstado15 = params.row.edocStatus === '15';
        const isEstado20 = params.row.edocStatus === '20';
        
        return (
          <div className="flex items-center gap-2">
            <PrimaryButton
              variant="text"
              size="small"
              onClick={() => navigate?.(`/orders/${order}`)}
            >
              {params.row.orderNo}
            </PrimaryButton>
            {isEstado15 && (
              <Chip
                label={t('order.invoiceError')}
                color="error"
                size="small"
                title={params.row.edocErrorMessage || t('order.invoiceErrorTooltip')}
              />
            )}
            {isEstado20 && params.row.edocNeedsVerification && (
              <Chip
                label={t('order.verifying')}
                color="warning"
                size="small"
                title={t('order.invoiceVerificationPending')}
              />
            )}
          </div>
        );  
      },
    },
    !isHotel && {
      headerName: t('tableData.tableNumber'),
      field: 'tableNo',
      flex: 1,
      minWidth: 100,
    },
    isHotel && {
      headerName: t('tableData.roomNumber'),
      field: 'roomNo',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: t('tableData.orderName'),
      field: 'name',
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: t('tableData.type'),
      field: 'type',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: t('tableData.items'),
      field: 'items',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: t('tableData.price'),
      field: 'total',
      flex: 1,
      minWidth: 80,
    },
    {
      headerName: t('tableData.paymentMode'),
      field: 'paymentType',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const paymentType = params.row.paymentType;
        if (params.row.payment === 'offline' && paymentType) {
          return paymentType === 'cash' ? (
            <Chip label={t('cash')} color="success" size="small" />
          ) : (
            <Chip label={t('card')} color="success" size="small" />
          );
        } else if (params.row.payment === 'online') {
          return <Chip label={t('order.paidOnline')} color="success" size="small" />;
        } else {
          return <Chip label={t('notPaid')} color="warning" size="small" />;
        }
      },
    },
    {
      field: 'action',
      headerName: t('tableData.action'),
      flex: 1,
      minWidth: 176,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const { status, paymentType, payment } = params.row;

        let buttonText = '';
        let color: 'primary' | 'warning' | 'success' = 'primary';
        switch (status) {
          case ORDER_STATUS.RECEIVED:
            buttonText = t('order.progress');
            color = 'warning';
            break;
          case ORDER_STATUS.PROGRESS:
            buttonText = t('order.markReady');
            color = 'success';
            break;
          case ORDER_STATUS.READY:
            buttonText = t('order.completeOrder');
            break;
        }
        const isButtonDisabled = () => {
          if (
            (status === ORDER_STATUS.READY &&
              paymentType === null &&
              payment === 'offline') ||
            !permissions?.includes('edit')
          )
            return true;

          return false;
        };

        const actionColumnCondition = () => {
          if (status === ORDER_STATUS.COMPLETED) {
            return (
              <Label variant="subtitle2" color="green">
                {t('order.completed')}
              </Label>
            );
          } else if (status === ORDER_STATUS.REFUNDED) {
            // Refunded orders shown in Cancelled tab
            return (
              <Label variant="subtitle2" color="orange">
                {t('order.refunded')}
              </Label>
            );
          } else if (status === ORDER_STATUS.CANCELLED) {
            return (
              <Label variant="subtitle2" color="red">
                {t('order.cancel')}
              </Label>
            );
          } else {
            return (
              <PrimaryButton
                size="small"
                variant="outlined"
                onClick={() => handleUpdateOrder(params.row)}
                disabled={isButtonDisabled()}
                color={color}
                tooltip={
                  isButtonDisabled() ? t('order.notPaidYet') : undefined
                }
              >
                {buttonText}
              </PrimaryButton>
            );
          }
        };
        return <div className={styles.action}>{actionColumnCondition()}</div>;
      },
    },
    {
      field: ' ',
      flex: 1,
      sortable: false,
      minWidth: 80,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div className="flex gap-4 justify-end">
            {params.row.invoiceUrl ? (
              <Link
                to={params.row.invoiceUrl}
                target="_blank"
                download={params.row.invoiceUrl}
              >
                <ReceiptOutlined fontSize="small" color="primary" />
              </Link>
            ) : null}
            <Iconbutton
              onClick={() => navigate?.(`/orders/${params.row.id}`)}
              MuiIcon={ArrowForwardIos}
              size="small"
            />
          </div>
        );
      },
    },
  ].filter(Boolean);

  if (!hasCompletedOrder && !hasCancelledOrder && !hasRefundedOrder) {
    commonColumns.splice(5, 0, {
      headerName: t('order.payment'),
      field: 'payment',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const { payment, paymentType } = params.row;

        if (payment === 'offline') {
          return (
            <PrimaryButton
              variant="text"
              color="error"
              onClick={() =>
                navigate?.(`/orders/${params.row.id}/payAtCounter`)
              }
              disabled={paymentType !== null ? true : false}
            >
              {t('order.payAtCounter')}
            </PrimaryButton>
          );
        } else {
          return <span className="px-1.5">Online</span>;
        }
      },
    });
    commonColumns.splice(6, 0, {
      headerName: t('order.cancelOrder'),
      field: 'cancel',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <PrimaryButton
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedOrderId?.(params.row.id);
              setDialogOpen?.(true);
            }}
          >
            {t('order.cancelOrder')}
          </PrimaryButton>
        );
      },
    });
  }

  return commonColumns;
};

interface IOrderTable {
  handleUpdateOrder: (order: {
    status: string;
    id: string;
    orderNo: string;
    name: string;
  }) => void;
  loading: boolean;
  rows: IOrder[];
  page: { limit: number; pageNo: number };
  setPage: Dispatch<SetStateAction<{ limit: number; pageNo: number }>>;
  totalItems: number;
  sortUser: GridSortItem[];
  handleSortModelChange: (val: GridSortModel) => void;
  highlightedRowId?: string | null;
  permissions?: string[];
}

export const OrderTable = ({
  handleUpdateOrder,
  loading,
  rows,
  page,
  setPage,
  totalItems,
  sortUser,
  handleSortModelChange,
  highlightedRowId,
  permissions,
}: IOrderTable) => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(
    null,
  );
  const [updateOrder] = useMutation(UPDATE_ORDER);

  const handleOrderCancel = () => {
    updateOrder({
      variables: {
        data: { id: selectedOrderId, status: ORDER_STATUS.CANCELLED },
      },
      refetchQueries: [GET_ORDERS_LIST],
    })
      .then(() => {
        const statusText = 'cancelled';
        toast.success(`${selectedOrderId} has been ${statusText}`);
        setDialogOpen(false);
      })
      .catch(() => {
        toast.error(t(ERROR_MESSAGES.GENERAL));
      });
  };
  return (
    <>
      <Table
        columns={
          columns(
            handleUpdateOrder,
            navigate,
            rows,
            setSelectedOrderId,
            setDialogOpen,
            userData?.businessType,
            permissions,
          ) as GridColDef[]
        }
        rows={rows}
        loading={loading}
        page={page.pageNo - 1}
        pageSize={page.limit}
        onPageChange={(page) =>
          setPage((prev) => ({ ...prev, pageNo: page + 1 }))
        }
        onPageSizeChange={(pageSize) =>
          setPage((prev) => ({ ...prev, limit: pageSize }))
        }
        rowCount={totalItems}
        sortModel={sortUser}
        onSortModelChange={handleSortModelChange}
        getRowClassName={(params) =>
          params.id === highlightedRowId ? 'highlightedRow' : ''
        }
      />
      <Dailog
        open={dialogOpen}
        title={t('order.sureToCancel')}
        confirmText="Confirm"
        cancelText="Close"
        onConfirm={handleOrderCancel}
        onCancel={() => setDialogOpen(false)}
        size="md"
      >
        {t('order.cannotBeUndone')}
      </Dailog>
    </>
  );
};
