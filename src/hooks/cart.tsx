import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const chave = 'GoMarketPlace:products';
  async function loadProducts(): Promise<void> {
    const myproducts = await AsyncStorage.getItem(chave);

    if (myproducts) {
      setProducts(JSON.parse(myproducts));
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const group = [...products];
      const index = group.findIndex(i => i.id === id);
      group[index].quantity += 1;

      setProducts([...group]);

      await AsyncStorage.setItem(chave, JSON.stringify([...group]));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const group = [...products];
      const index = group.findIndex(i => i.id === id);
      const qtd = group[index].quantity;

      if (qtd === 1) {
        // tirar do carrinho
        const newCart = group.filter(i => i.id !== id);
        setProducts(newCart);
        await AsyncStorage.setItem(chave, JSON.stringify(newCart));
      } else {
        // decrement 1

        group[index].quantity -= 1;
        setProducts(group);
        await AsyncStorage.setItem(chave, JSON.stringify(group));
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const { id, title, image_url, price } = product;

      const exists = products.find(i => i.id === id);

      if (exists) {
        increment(id);
      } else {
        const obj = {
          id,
          title,
          image_url,
          price,
          quantity: 1,
        };

        const teste = [...products, obj];
        setProducts(teste);

        await AsyncStorage.setItem(chave, JSON.stringify(teste));
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
