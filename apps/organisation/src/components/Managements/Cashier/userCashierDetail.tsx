import { PrimaryButton, Table } from '@ethos-frontend/ui';
import { priceWithSymbolAdmin } from '@ethos-frontend/utils';
import {
  GridRenderCellParams,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid-premium';
import { useUser } from '../../../context/user';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PageType {
  limit: number;
  pageNo: number;
}

export const UserCashierDetail = ({
  rows,
  loading,
  totalItems,
  page,
  setPage,
  handleSortModelChange,
  sortUser,
}: {
  rows: Record<string, unknown>[];
  loading: boolean;
  totalItems: number;
  page: PageType;
  setPage: React.Dispatch<React.SetStateAction<PageType>>;
  handleSortModelChange: (value: GridSortModel) => void;
  sortUser: GridSortItem[];
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUser();

  const columns = useMemo(
    () => [
      {
        field: 'orderNo',
        headerName: t('tableData.orderNumber'),
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const order = params.row.orderId;
          return (
            <PrimaryButton
              variant="text"
              size="small"
              onClick={() => navigate?.(`/orders/${order}`)}
            >
              {params.row.orderNo}
            </PrimaryButton>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: t('tableData.orderPaid'),
        flex: 1,
      },
      // {
      //   field: 'initialBalance',
      //   headerName: t('tableData.initialBalance'),
      //   flex: 1,
      //   renderCell: (params: GridRenderCellParams) =>
      //     priceWithSymbolAdmin(params?.row?.initialBalance, userData?.currency),
      // },
      {
        field: 'balance',
        headerName: t('tableData.transactionAmount'),
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          priceWithSymbolAdmin(params?.row?.balance, userData?.currency),
      },
      // {
      //   field: 'finalBalance',
      //   headerName: t('tableData.finalBalance'),
      //   flex: 1,
      //   renderCell: (params: GridRenderCellParams) =>
      //     priceWithSymbolAdmin(params?.row?.finalBalance, userData?.currency),
      // },
      {
        field: 'paymentType',
        headerName: t('tableData.paymentMode'),
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const paymentType = params.row.paymentType;
          return paymentType === 'card' ? t('card') : t('cash');
        },
      },
    ],
    [],
  );

  return (
    <Table
      rows={rows}
      columns={columns}
      rowCount={totalItems}
      loading={loading}
      page={page.pageNo - 1}
      pageSize={page.limit}
      onPageChange={(newPage) =>
        setPage((prev: { limit: number; pageNo: number }) => ({
          ...prev,
          pageNo: newPage + 1,
        }))
      }
      onPageSizeChange={(newPageSize) =>
        setPage((prev: { limit: number; pageNo: number }) => ({
          ...prev,
          limit: newPageSize,
        }))
      }
      sortModel={sortUser}
      onSortModelChange={handleSortModelChange}
    />
  );
};
