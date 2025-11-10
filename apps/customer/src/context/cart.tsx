import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCart, updateCart as updateCartUtil } from '../utils/cart';
import { IProductList } from '../types/product';

interface CartContextType {
  cart: IProductList[];
  updateCart: (data: IProductList, newCount: number) => void;
  setCart: React.Dispatch<React.SetStateAction<IProductList[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<IProductList[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCart(getCart());
    }
  }, []);
  
  const updateCart = (data: IProductList, newCount: number) => {
    const updatedCart = updateCartUtil({ data, newCount });
    setCart(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, updateCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
