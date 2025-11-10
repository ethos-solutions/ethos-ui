import { getStorage, setStorage } from '@ethos-frontend/utils';
import {
  Extra,
  IExtraProducts,
  IExtras,
  IProductList,
  ISelectedValues,
} from '../types/product';

export const mapExtrasWithProducts = (
  extras: IExtras[],
  extraProducts: IProductList[],
) => {
  return extras.map((extra) => ({
    ...extra,
    products: extra.products.map((productId) =>
      extraProducts.find(
        (product) => product._id.toString() === productId.toString(),
      ),
    ),
  }));
};

export const calculateTotalPrice = (
  basePrice: number,
  selectedValues: ISelectedValues[],
) => {
  const extrasPrice = selectedValues.reduce(
    (acc, curr) => acc + (curr.price || 0),
    0,
  );
  return basePrice + extrasPrice;
};

export const calculateTax = (
  price: number,
  taxesDetail: { value: number }[],
  taxMode: string,
) => {
  const taxPercentage = taxesDetail
    ? taxesDetail.reduce((acc, tax) => acc + tax.value, 0)
    : 0;

  if (taxMode === 'included') {
    const baseValue = price / (1 + taxPercentage / 100);
    const taxValue = price - baseValue;
    return { baseValue, taxValue };
  } else {
    const taxValue = price * (taxPercentage / 100);
    return { baseValue: price, taxValue };
  }
};

export const handleCustomization = (
  cart: IProductList[],
  data: IProductList,
  selectedCategoryType: string | undefined,
  requiredExtra: Extra[],
  navigateToProductPage: () => void,
  setExistingCartProducts: (products: any[]) => void,
  setExistingProductDrawer: (open: boolean) => void,
): boolean => {
  const isMultipleCombo = data.categoryDetail.category_type === 'combo';

  const existingCartProduct = cart.find((item) => item._id === data._id);
  const existingCartProductArray = cart.filter((item) => item._id === data._id);

  if (
    (!existingCartProduct && requiredExtra?.length > 0) ||
    (isMultipleCombo && !existingCartProduct)
  ) {
    navigateToProductPage();
    return true;
  } else if (
    requiredExtra?.length > 0 ||
    (isMultipleCombo && existingCartProduct)
  ) {
    setExistingCartProducts(existingCartProductArray);
    setExistingProductDrawer(true);
    return true;
  }
  return false;
};

export const extrasRadioChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  groupName: string,
  productData: { extrasProducts: IExtraProducts[] },
  selectedValues: ISelectedValues[],
) => {
  const selectedName = e.target.value;

  const selectedProduct = productData?.extrasProducts.find(
    (product: IExtraProducts) => product._id === selectedName,
  );

  const newSelectedValues = [
    {
      groupName,
      label: selectedProduct?.name || '',
      value: selectedProduct?._id || '',
      price: selectedProduct?.price,
    },
  ];
  const updatedValues = selectedValues
    .filter((value) => value.groupName !== groupName)
    .concat(newSelectedValues);

  return updatedValues;
};

export const clearSessionStorageExcept = (keysToKeep: string[]) => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return;
  }
  
  const preserved: Record<string,string> = {};
  keysToKeep.forEach((key) => {
    const val = sessionStorage.getItem(key);
    if (val !== null) preserved[key] = val;
  });
  sessionStorage.clear();

  Object.entries(preserved).forEach(([key, val]) => {
    sessionStorage.setItem(key, val);
  });
};
