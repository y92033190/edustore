import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (product) => {
    setItems(prev =>
      prev.find(i => i.id === product.id) ? prev : [...prev, product]
    );
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
