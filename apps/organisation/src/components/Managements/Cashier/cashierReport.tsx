import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRestQuery } from '@ethos-frontend/hook';
import {
  dateFormatInUtc,
  getNumberOfCols,
  priceWithSymbolAdmin,
  useResponsive,
} from '@ethos-frontend/utils';
import { useParams } from 'react-router-dom';
import { Card, GridContainer } from '@ethos-frontend/components';
import { Header } from '../../Common';
import {
  AutoComplete,
  DateTimeRangePicker,
  Paragraph,
} from '@ethos-frontend/ui';
import { useQuery } from '@apollo/client';
import { GET_USER_NAME } from '../../../api/queries/UserManagement';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { Dayjs } from 'dayjs';
import { UserCashierDetail } from './userCashierDetail';
import { useUser } from '../../../context/user';
import { GridSortItem, GridSortModel } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import { API_URL, EMPLOYEE_API_URL, ROLES, paymentType as types } from '@ethos-frontend/constants';

export const CashierReport = () => {
  const { id, name } = useParams();
  const { userData } = useUser();
  const { isDesktop, isMobile } = useResponsive();
  const { t } = useTranslation();
  const getPaymentType = types();

  const userIdBoolean =
    userData?.role === ROLES.EMPLOYEE || userData?.type === ROLES.ORGANISATION;
  const userId = userIdBoolean && !name ? userData?._id : id;

  const [cashierData, setCashierData] = useState([]);
  const [range, setRange] = useState<DateRange<Dayjs | Date>>([null, null]);
  const [sortUser, setSortUser] = useState<GridSortItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState({
    limit: 10,
    pageNo: 1,
  });
  const [paymentType, setPaymentType] = useState({
    value: '',
    label: '',
  });
  const startDateTimestamp = range?.[0]?.valueOf()?.toString();
  const endDateTimestamp = range?.[1]?.valueOf()?.toString();

  const sortField = sortUser[0]?.field || null;
  const sortOrder = sortUser[0]?.sort === 'asc' ? 1 : -1;

  const queryKey = useMemo(
    () =>
      [
        'get_cashier_data',
        userId,
        startDateTimestamp || undefined,
        endDateTimestamp || undefined,

        page,
        sortUser,
        paymentType?.value,
      ].filter(Boolean),
    [
      userId,
      startDateTimestamp,
      endDateTimestamp,

      page,
      setPage,
      sortUser,
      paymentType?.value,
    ],
  );

  const userCashierDetailApiURL = useMemo(
    () =>
      userData?.role === ROLES.EMPLOYEE
        ? `${EMPLOYEE_API_URL.cashierEmployee}?`
        : `${API_URL.adminCashier}?userId=${userId}&`,
    [userData?.role, userId],
  );

  const url = `${userCashierDetailApiURL}${
    startDateTimestamp ? `&startDate=${startDateTimestamp}` : ''
  }${endDateTimestamp ? `&endDate=${endDateTimestamp}` : ''}&pageNo=${
    page.pageNo
  }&limit=${page.limit}${
    sortField ? `&sortBy=${sortField}` : ''
  }&sortOrder=${sortOrder}&paymentType=${
    paymentType?.value ? paymentType?.value : ''
  }`;

  const { data, isLoading: cashierDetailLoading } = useRestQuery(queryKey, url);

  useEffect(() => {
    if (data) {
      const formattedData = data.data.data.map(
        ({
          createdAt,
          balance,
          orderNo,
          finalBalance,
          initialBalance,
          paymentType,
          orderId,
          _id
        }: {
          createdAt: string;
          balance: string;
          orderId: string;
          finalBalance: number;
          initialBalance: number;
          orderNo: string;
          paymentType: string;
          _id: string
        }) => ({
          id: _id,
          orderId,
          orderNo,
          createdAt: dateFormatInUtc(createdAt),
          balance,
          paymentType,
          finalBalance: finalBalance?.toFixed(2),
          initialBalance: initialBalance?.toFixed(2),
        }),
      );
      setCashierData(formattedData);
      setTotalItems(data.data.totalItems);
    }
  }, [data]);

  const { data: getUserDetail } = useQuery(GET_USER_NAME, {
    variables: { employeeId: userId },
    skip: !name,
  });

  const handleDateChange = useCallback(
    (value: DateRange<Dayjs | Date>) => setRange(value),
    [],
  );

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortUser([...newSortModel]);
  };

  const headerText = getUserDetail?.employee?.data
    ? `${t('cashier.report')} ${getUserDetail?.employee?.data?.firstName} ${getUserDetail?.employee?.data?.lastName}`
    : t('cashier.balance');

  return (
    <>
      <Header title={headerText}>
        <DateTimeRangePicker onChange={handleDateChange} initialValue={range} />
        <AutoComplete
          options={getPaymentType}
          label={t('cashier.paymentType')}
          value={paymentType}
          onChange={(_e: any, value: any) => setPaymentType(value)}
        />{' '}
      </Header>
      <GridContainer columns={12}>
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            mobileCol: 12,
            desktopCol: 2,
          })}
          className="flex xl:flex-col sm:flex-row sm:self-start gap-3 "
        >
          <Card title={t('total')} className="flex-1">
            <Paragraph variant="subtitle2">
              {priceWithSymbolAdmin(data?.data?.total, userData?.currency)}
            </Paragraph>
          </Card>
          <Card
            title={t('cashier.totalByCard')}
            data-item
            data-span={getNumberOfCols({ isDesktop, isMobile })}
            className="flex-1"
          >
            <Paragraph variant="subtitle2">
              {priceWithSymbolAdmin(data?.data?.totalByCard, userData?.currency)}
            </Paragraph>
          </Card>

          <Card
            title={t('cashier.totalByCash')}
            data-item
            data-span={getNumberOfCols({ isDesktop, isMobile })}
            className="flex-1"
          >
            <Paragraph variant="subtitle2">
              {priceWithSymbolAdmin(data?.data?.totalByCash, userData?.currency)}
            </Paragraph>
          </Card>
        </div>
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 10,
            mobileCol: 12,
          })}
        >
          <UserCashierDetail
            rows={cashierData}
            loading={cashierDetailLoading}
            totalItems={totalItems}
            page={page}
            setPage={setPage}
            handleSortModelChange={handleSortModelChange}
            sortUser={sortUser}
          />
        </div>
      </GridContainer>
    </>
  );
};
