import { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  minWeight: string;
  code: string;
  category: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'delivered';
  orderDate: string;
  estimatedDelivery?: string;
  advancePaid: number;
  balanceAmount: number;
  totalWeight: string;
  notes?: string;
}

interface OrdersContextType {
  orders: Order[];
  userOrders: Order[];
  createOrder: (items: OrderItem[], userId: string) => string;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getUserOrders: (userId: string) => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (items: OrderItem[], userId: string): string => {
    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      userId,
      items,
      status: 'pending',
      orderDate: new Date().toISOString(),
      advancePaid: 0,
      balanceAmount: 0,
      totalWeight: '0g'
    };
    
    setOrders(prev => [...prev, newOrder]);
    return newOrder.id;
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };

  const userOrders = orders; // For admin view

  return (
    <OrdersContext.Provider value={{
      orders,
      userOrders,
      createOrder,
      updateOrder,
      getUserOrders
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
