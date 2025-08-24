import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToastNotifications } from '../hooks/use-toast-notifications';

export default function FavoritesSidebar() {
  const { favorites, removeFromFavorites, favoritesCount } = useFavorites();
  const { addToCart } = useCart();
  const { isLoggedIn, showAuthModal } = useAuth();
  const { showAddedToCart, showLoginRequired } = useToastNotifications();

  const handleAddToCart = (product: any) => {
    if (!isLoggedIn) {
      showLoginRequired();
      showAuthModal();
      return;
    }
    addToCart(product);
    showAddedToCart(product.name);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Heart className="w-5 h-5" />
          {favoritesCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white">
              {favoritesCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Favorites ({favoritesCount})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No favorites yet</p>
              <p className="text-sm text-gray-400 mt-2">Add items to your favorites to see them here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {favorites.map((item) => (
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
                        
                        <div className="flex items-center justify-between mt-3">
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => removeFromFavorites(item.id)}
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
