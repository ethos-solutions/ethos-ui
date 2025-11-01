import React from 'react';
import { Card, GridContainer } from '@ethos-frontend/components';
import { getNumberOfCols, useResponsive } from '@ethos-frontend/utils';
import { IOrder } from '../Managements';
import styles from './kitchen.module.scss';
import { Chip, Heading, Label, PrimaryButton } from '@ethos-frontend/ui';
import { ORDER_STATUS } from '@ethos-frontend/constants';
import { useUser } from '../../context/user';
import { Skeleton } from '@mui/material';
import {t} from "i18next";
export interface IProductItem {
  _id: string;
  qty: number | string;
  name: string;
  comboProducts: Array<{
    _id: string;
    name: string;
    options: Array<{ name: string }>;
  }>;
  extras: Array<{
    groupName: string;
    products: Array<{ name: string }>;
  }>;
  note?: string;
}
interface IKitchenCard {
  orderList: IOrder[];
  status: { orderStatus: string; buttonText: string } | null;
  handleUpdateOrder: (value: IOrder) => void;
}

// Extracted product renderer
const ProductItem: React.FC<{ item: IProductItem; orderId: string }> = ({ item, orderId }) => (
  <div key={`${orderId}-item-${item._id}`} className={styles.border}>
    <Label variant="subtitle2">{item.qty}</Label>
    <Label variant="subtitle2" weight="medium" className="pl-2">
      {item.name}
    </Label>

    {item.comboProducts?.length > 0 && (
      <div className="flex flex-col gap-2 pt-2">
        <Heading variant="subtitle2">{t('kitched.combo')}</Heading>
        {item.comboProducts.map((combo, idx) => (
          <div
            className="ml-4 flex flex-col gap-2"
            key={`${orderId}-combo-${combo._id}-${idx}`}>
            <Label variant="body1">
              {combo.name || combo.options.map(o => o.name).join(', ')}
            </Label>
          </div>
        ))}
      </div>
    )}

    {item.extras?.length > 0 && (
      <div className="flex flex-col gap-2 pt-2">
        <Heading variant="subtitle2">{t('kitchen.extras')}</Heading>
        {item.extras.map((group, gIdx) => (
          <div
            className="ml-4 flex flex-col gap-2"
            key={`${orderId}-extra-${group.groupName}-${gIdx}`}>
            {group.products.map((prod, pIdx) => (
              <Label
                key={`${orderId}-extra-${group.groupName}-${pIdx}`}
                variant="body1">
                {prod.name}
              </Label>
            ))}
          </div>
        ))}
      </div>
    )}

    {item.note && (
      <div className="flex flex-col gap-2 pt-2">
        <Heading variant="subtitle2">{t('kitchen.notes')}</Heading>
        <div className="ml-4 flex flex-col gap-2">
          <Label variant="body1">{item.note}</Label>
        </div>
      </div>
    )}
  </div>
);

export const KitchenCardSkeleton = () => {
  const { isDesktop, isMobile } = useResponsive();
  return (
    <GridContainer columns={12}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          className={styles.loader}
          data-item
          data-span={getNumberOfCols({ isDesktop, isMobile, desktopCol: 4, mobileCol: 6 })}
          key={i}
        >
          <div className="flex gap-5">
            <div><Skeleton width={100} /><Skeleton width={100} /></div>
            <div><Skeleton width={100} /><Skeleton width={100} /></div>
          </div>
          <div><Skeleton /><Skeleton /><Skeleton /></div>
        </div>
      ))}
    </GridContainer>
  );
};

export const KitchenCard: React.FC<IKitchenCard> = ({ orderList, status, handleUpdateOrder }) => {
  const { isDesktop, isMobile } = useResponsive();
  const { userData } = useUser();

  return (
    <GridContainer columns={12}>
      {orderList.map(order => (
        <div
          data-item
          data-span={getNumberOfCols({ isDesktop, isMobile, desktopCol: 4, mobileCol: 6 })}
          key={order.id}
        >
          <Card>
            <div className={styles.header}>
              <div className="flex flex-col gap-2">
                <Label variant="subtitle1">
                  {order.orderNo}{order.name && ` - ${order.name}`}
                </Label>
                <Label variant="body1">
                  {userData?.businessType === 'Hotels'
                    ? `${t('kitchen.roomNo')} ${order.roomNo}`
                    : `${t('kitchen.tableNo')} ${order.tableNo}`}
                  {order.type === 'DineIn' ? `/ ${t('dineIn')} ` : `/ ${t('takeAway')}`}
                </Label>
              </div>
              <Chip
                size="small"
                color={status?.orderStatus === ORDER_STATUS.PROGRESS ? 'success' : 'warning'}
                label={status?.buttonText || ''}
                sx={{
                  background: status?.orderStatus === ORDER_STATUS.PROGRESS
                    ? 'rgba(21, 153, 86, .15)'
                    : 'rgba(201, 112, 0, .15)',
                  color: status?.orderStatus === ORDER_STATUS.PROGRESS
                    ? 'rgb(21, 153, 86)'
                    : 'rgb(201 122 0)',
                }}
              />
            </div>

            <div className={styles.card}>
              {order.productItems.map((item: IProductItem, idx: number) => (
                <ProductItem item={item} orderId={order.id} key={idx} />
              ))}
            </div>

            <PrimaryButton
              className={styles.button}
              size="small"
              fullWidth
              onClick={() => handleUpdateOrder(order)}
              style={{ textTransform: 'uppercase', marginTop: 12 }}
            >
              {status?.orderStatus === ORDER_STATUS.PROGRESS
                ? t('kitchen.finishCooking')
                : t('kitchen.startCooking')}
            </PrimaryButton>
          </Card>
        </div>
      ))}
    </GridContainer>
  );
};
