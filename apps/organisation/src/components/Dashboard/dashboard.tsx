import { useRestQuery } from '@ethos-frontend/hook';
import { Card, GridContainer } from '@ethos-frontend/components';
import styles from './dashboard.module.scss';
import {
  getFormattedTimestamp,
  getNumberOfCols,
  useResponsive,
} from '@ethos-frontend/utils';
import { IoFastFoodOutline } from 'react-icons/io5';
import { TbBasketCancel } from 'react-icons/tb';
import { DashboardCards } from './dashboardCards';
import { RecentOrder } from './recentOrder';
import { useSocket } from '../../context/socket';
import { useEffect, useMemo, useState } from 'react';
import { IOrder } from '../Managements';
import {
  API_URL,
  ERROR_MESSAGES,
  ORDER_STATUS,
  ROLES,
} from '@ethos-frontend/constants';
import { TopSelling } from './topSelling';
import { RevenueChart } from './revenueChart';
import { CountCard } from './orderCount';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { TotalCashPie } from './totalCashPie';
import { useUser } from '../../context/user';
import { DateRangePicker, Heading, PrimaryButton } from '@ethos-frontend/ui';
import { toast } from 'react-toastify';
import { STRIPE_CONNECT_STATUS } from '../../constants';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { userData } = useUser();

  const { isDesktop, isMobile } = useResponsive();
  const { socket } = useSocket();
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [orderCount, setOrderCount] = useState({ ofline: 0, online: 0 });
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const hasDashboardList = useMemo(() => {
    if (!userData) return false;
    if (userData.type === 'ORGANISATION') return true;
    const dash = userData.access?.find((p) => p.module === 'dashboard');
    return dash?.pages.includes('list') ?? false;
  }, [userData]);

  if (userData && !hasDashboardList) {
    return (
      <div>
        <Heading variant="h2">Welcome to {userData.restaurantName}!</Heading>
      </div>
    );
  }

  const [start, end] = dateRange;

  let startTs;
  let endTs;

  if (start && end) {
    startTs = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0,
      0,
    );

    endTs = Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  const reportsUrl = `${API_URL.dashboard}${
    start && end ? `?startDate=${startTs}&endDate=${endTs}` : ''
  }`;
  const countUrl = `${API_URL.orderCount}${
    start && end ? `?startDate=${startTs}&endDate=${endTs}` : ''
  }`;
  const mostSellingUrl = `${API_URL.mostSellingItem}${
    start && end ? `?startDate=${startTs}&endDate=${endTs}` : ''
  }`;

  const exportUrl =
    start && end
      ? `${API_URL.exportDashboardData}?startDate=${startTs}&endDate=${endTs}`
      : '';

  const { data: dashboardReport, isLoading: isReportLoading } = useRestQuery(
    ['get_reports', startTs, endTs],
    reportsUrl,
    {
      enabled: !!userData,
      onError: (err) => {
        if (err.message.includes('Cannot read properties')) {
          toast.error(t(ERROR_MESSAGES.GENERAL));
        }
      },
    },
  );
  const { data: mostSellingItems, isLoading: isSellingLoading } = useRestQuery(
    ['get_mostSellingItems', startTs, endTs],
    mostSellingUrl,
    { enabled: !!userData },
  );

  const { isLoading: isOrderCountLoading } = useRestQuery(
    ['order_count', startTs, endTs],
    countUrl,
    {
      enabled: !!userData,
      onSuccess: (res) => {
        setOrderCount({ online: res.data?.online, ofline: res.data?.offline });
      },
    },
  );

  const isDashboardLoading =
    isReportLoading || isSellingLoading || isOrderCountLoading;

  useEffect(() => {
    if (dashboardReport?.data) {
      setRecentOrders(dashboardReport.data.recentOrders);
      setPendingOrders(dashboardReport.data.pendingOrders);
    }
  }, [dashboardReport]);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: string) => {
        const newOrder = JSON.parse(message);

        if (newOrder.status === ORDER_STATUS.RECEIVED) {
          setRecentOrders((prevOrders) => [newOrder, ...prevOrders]);
          setPendingOrders((prevPending) => prevPending + 1);
          setHighlightedRowId(newOrder._id);
          setTimeout(() => {
            setHighlightedRowId(null);
          }, 3000);
        } else if (newOrder.status === ORDER_STATUS.COMPLETED) {
          setPendingOrders((prevPending) => prevPending - 1);
        }
      });

      return () => {
        socket.off('message');
        socket.disconnect();
      };
    }
  }, [socket]);

  const { refetch: exportDashboard, isLoading: isExporting } = useRestQuery(
    'export_dashboard',
    exportUrl,
    {
      enabled: false,
      onSuccess: async (res) => {
        const pdfUrl =
          typeof res.data === 'string' ? res.data : (res.data.url as string);
        try {
          const response = await fetch(pdfUrl, { mode: 'cors' });
          if (!response.ok) throw new Error('Failed to fetch PDF');
          const blob = await response.blob();

          const filename = `report_${getFormattedTimestamp()}.pdf`;
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error('Download error', err);
        }
      },
      onError: (err) => console.error('Export failed', err),
    },
  );

  const { refetch: openStripeDashboard, isLoading: openingStripe } =
    useRestQuery(['stripe_dashboard_link'], API_URL.stripeDashboardLink, {
      enabled: false,
      onSuccess: (res) => {
        const url = res.data?.url || res.data?.onboardingUrl;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        else toast.error(t(ERROR_MESSAGES.GENERAL));
      },
      onError: () => toast.error(t(ERROR_MESSAGES.GENERAL)),
    });

  return (
    <>
      <div className="flex items-stretch gap-5 mb-5">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          dateSeparator={t('to')}
          disabled={!userData}
          disableFuture
          maxDate={new Date()}
        />
        <div className="flex gap-4 flex-1">
          <PrimaryButton
            variant="outlined"
            onClick={() => setDateRange([null, null])}
            size="small"
          >
            {t('dashboard.reset')}
          </PrimaryButton>
          <PrimaryButton
            variant="outlined"
            onClick={() => exportDashboard()}
            disabled={!start || !end || isExporting}
            loading={isExporting}
            size="small"
          >
            {t('dashboard.export')}
          </PrimaryButton>
           {userData?.stripeConnectStatus === STRIPE_CONNECT_STATUS.CONNECTED && userData?.type === ROLES.ORGANISATION ? (
            <div style={{ marginLeft: 'auto' }}>
              <PrimaryButton
                onClick={() => openStripeDashboard()}
                loading={openingStripe}
              >
                Open stripe Dashboard
              </PrimaryButton>
            </div>
          ) : null}
        </div>
      </div>
      <GridContainer columns={12}>
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 5,
            mobileCol: 12,
          })}
          className="grid grid-cols-2 gap-5"
        >
          <DashboardCards
            loading={isDashboardLoading}
            title={t('completedOrders')}
            icon={<IoFastFoodOutline size={30} color="var(--primary)" />}
            data={dashboardReport?.data?.completedOrders}
            nocurrency
          />
          <DashboardCards
            title={t('pendingOrders')}
            loading={isDashboardLoading}
            icon={<MdOutlinePendingActions size={30} color="var(--primary)" />}
            data={pendingOrders}
            nocurrency
          />

          <CountCard
            loading={isDashboardLoading}
            title={t('totalRevenue')}
            icon={<IoFastFoodOutline size={30} color="var(--primary)" />}
            onlineCount={dashboardReport?.data?.totalOnlineRevenue}
            offlineCount={dashboardReport?.data?.totalOfflineRevenue}
          />
          <CountCard
            loading={isDashboardLoading}
            title={t('totalOrders')}
            icon={<TbBasketCancel size={30} color="var(--primary)" />}
            offlineCount={orderCount.ofline}
            onlineCount={orderCount.online}
            nocurrency
          />
          <div className="col-span-2">
            <TotalCashPie start={startTs} end={endTs} />
          </div>
        </div>
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 7,
            mobileCol: 12,
          })}
        >
          <Card className={styles.chart}>
            <RevenueChart />
          </Card>
        </div>
      </GridContainer>

      <GridContainer columns={12} className="pt-5">
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 8,
            mobileCol: 12,
          })}
        >
          <RecentOrder
            data={recentOrders}
            highlightedRowId={highlightedRowId}
          />
        </div>
        <div
          data-item
          data-span={getNumberOfCols({
            isDesktop,
            isMobile,
            desktopCol: 4,
            mobileCol: 12,
          })}
        >
          <TopSelling
            data={mostSellingItems?.data || []}
            dateRange={dateRange}
          />
        </div>
      </GridContainer>
    </>
  );
};
