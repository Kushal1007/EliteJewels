import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrdersContext';
import { useToastNotifications } from '../hooks/use-toast-notifications';

export default function CartSidebar() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, clearCart } = useCart();
  const { isLoggedIn, user, showAuthModal } = useAuth();
  const { createOrder } = useOrders();
  const { showOrderPlaced } = useToastNotifications();

  const handleOrderNow = () => {
    if (!isLoggedIn) {
      showAuthModal();
      return;
    }

    if (cartItems.length === 0) return;

    // Create order
    const orderId = createOrder(cartItems, user?.email || 'demo@Mohan Jewellers.com');

    // Create WhatsApp message
    const itemsText = cartItems.map(item =>
      `${item.name} (${item.code}) - Qty: ${item.quantity}, Min. Weight: ${item.minWeight}`
    ).join('\n');

    const message = `Hi! I would like to place an order:\n\nOrder ID: ${orderId}\n\nItems:\n${itemsText}\n\nPlease confirm the weights, pricing, and delivery timeline. Thank you!`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;

    // Show success notification and open WhatsApp (don't clear cart)
    showOrderPlaced(orderId);
    window.open(whatsappUrl, '_blank');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-yellow-500 text-white">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shopping Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-2">Add some beautiful jewelry to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500">Code: {item.code}</p>
                          <p className="text-xs text-gray-500">Min. Weight: {item.minWeight}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-6 h-6 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-6 h-6 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleOrderNow}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Order Now via WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
