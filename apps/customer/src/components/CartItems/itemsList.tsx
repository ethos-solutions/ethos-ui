import React from 'react';
import { IProductList } from '../../types/product';
import styles from './cartItems.module.scss';
import { Counter, Iconbutton, Label } from '@ethos-frontend/ui';
import { useRouter } from 'next/router';
import { priceWithSymbol } from '@ethos-frontend/utils';
import { PRODUCT_TYPE } from '../../constant';
import Image from 'next/image';

interface IItemsList {
  productList: IProductList[];
  onIncrement: (product: IProductList) => void;
  onDecrement: (product: IProductList) => void;
  handleDelete?: (id: string) => void;
}

export const ItemsList = ({
  productList,
  onIncrement,
  onDecrement,
  handleDelete,
}: IItemsList) => {
  const selectedExtras = (index: number) =>
    productList[index]?.selectedExtras
      ?.map(
        (el) =>
          `${el.label} ${el.price ? `(${priceWithSymbol(el.price)})` : ''}`,
      )
      .join(' | ');

  const router = useRouter();

  const link = (product: IProductList) => {
    if (product.productKey && product.productType === 'combo') {
      return `combo/${product._id}?key=${product.productKey}`;
    }
    if (product.productKey) {
      return `product/${product._id}?key=${product.productKey}`;
    }
    return `product/${product._id}`;
  };

  const selectedProducts = (index: number) =>
    productList[index]?.selectedComboProducts
      ?.map(
        (el) =>
          `${el.label} ${el.price ? `(${priceWithSymbol(el.price)})` : ''}`,
      )
      .join(' | ');

  return productList?.map((product, i) => (
    <div key={product._id + i + 1} className="flex items-start py-5 gap-4">
      <Image
        src={product.imgUrl[0]}
        width={80}
        height={80}
        alt="Product Image"
      />
      <div className={styles.orderItemHolder}>
        <div className={styles.orderItemName}>
          <div className="flex items-center gap-2">
            <Label variant="subtitle2" weight="semibold">
              {product.name}
            </Label>
            <Iconbutton
              name={product.type === PRODUCT_TYPE.VEG ? 'veg' : 'non-veg'}
            />
          </div>

          <div className="flex gap-2">
            <Iconbutton
              onClick={() => router.push(link(product))}
              className="!p-0 !min-h-min !min-w-min"
              name="edit"
              iconColor={'var(--text-color)'}
            />
            <Iconbutton
              onClick={() => handleDelete?.(product.productKey)}
              className="!p-0 !min-h-min !min-w-min"
              name="delete"
              iconColor={'var(--error)'}
            />
          </div>
        </div>
        {selectedProducts(i) && (
          <div className={styles.description}>
            <Label variant="body1" className="pb-2 block">
              {`Selected Products: ${selectedProducts(i)}`}
            </Label>
          </div>
        )}

        {selectedExtras(i) && (
          <div className={styles.description}>
            <Label variant="body1" className="pb-2 block">
              {selectedExtras(i)}
            </Label>
          </div>
        )}

        <Label variant="body1" className={styles.characters}>
          {product?.characteristicsDetail?.map((val) => val.name).join(' | ')}
          {product?.characteristicsDetail?.length && product.calory ? (
            <span className="ml-1">| </span>
          ) : null}
          {product.calory ? `${product.calory} cal` : null}{' '}
        </Label>

        {product.note && (
          <Label variant="body1">Additional Note: {product.note}</Label>
        )}

        <div className={styles.countHolder}>
          <Label
            variant="subtitle2"
            color={'var(--primary-color)'}
            weight="semibold"
          >
            {priceWithSymbol(product.finalPrice)}
          </Label>
          <Counter
            count={product.quantity || 0}
            setCount={(_count: number | ((prevValue: number) => number)) => {
              // Counter state is managed via onIncrement/onDecrement
            }}
            onIncrement={() => onIncrement(product)}
            onDecrement={() => onDecrement(product)}
          />
        </div>
      </div>
    </div>
  ));
};
