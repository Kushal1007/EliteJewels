import { toast } from 'sonner';

export const useToastNotifications = () => {
  const showAddedToCart = (productName: string) => {
    toast.success(`${productName} added to cart!`, {
      description: 'Item has been added to your shopping cart',
      duration: 3000,
    });
  };

  const showAddedToFavorites = (productName: string) => {
    toast.success(`${productName} added to favorites!`, {
      description: 'Item has been saved to your favorites',
      duration: 3000,
    });
  };

  const showRemovedFromFavorites = (productName: string) => {
    toast.info(`${productName} removed from favorites`, {
      description: 'Item has been removed from your favorites',
      duration: 3000,
    });
  };

  const showLoginRequired = () => {
    toast.error('Login Required', {
      description: 'Please login to add items to your cart',
      duration: 4000,
    });
  };

  const showOrderPlaced = (orderId: string) => {
    toast.success('Order Placed Successfully!', {
      description: `Order ${orderId} has been sent via WhatsApp`,
      duration: 4000,
    });
  };

  return {
    showAddedToCart,
    showAddedToFavorites,
    showRemovedFromFavorites,
    showLoginRequired,
    showOrderPlaced,
  };
};
