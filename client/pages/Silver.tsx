import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useToastNotifications } from '../hooks/use-toast-notifications';

interface Product {
  id: string;
  name: string;
  image: string;
  minWeight: string;
  code: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
}

export default function Silver() {
  const [selectedCategory, setSelectedCategory] = useState('rings');
  const [showFullCollection, setShowFullCollection] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isLoggedIn, showAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { showAddedToCart, showAddedToFavorites, showRemovedFromFavorites, showLoginRequired } = useToastNotifications();

  const categories: Category[] = [
    { id: 'rings', name: 'Rings', code: 'SR' },
    { id: 'chains', name: 'Chains', code: 'SC' },
    { id: 'bangles', name: 'Bangles', code: 'SB' },
    { id: 'earrings', name: 'Earrings', code: 'SE' },
    { id: 'necklaces', name: 'Necklaces', code: 'SN' },
    { id: 'pendants', name: 'Pendants', code: 'SP' },
  ];

  // Mock product data - in a real app this would come from an API
  const allProducts: Record<string, Product[]> = {
    rings: [
      { id: 'SR0001', name: 'Classic Silver Ring', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '3.2g', code: 'SR0001', category: 'rings' },
      { id: 'SR0002', name: 'Sterling Silver Band', image: 'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=400&h=400&fit=crop', minWeight: '4.1g', code: 'SR0002', category: 'rings' },
      { id: 'SR0003', name: 'Oxidized Silver Ring', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '3.8g', code: 'SR0003', category: 'rings' },
      { id: 'SR0004', name: 'Silver Stone Ring', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '4.5g', code: 'SR0004', category: 'rings' },
      { id: 'SR0005', name: 'Vintage Silver Ring', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '3.7g', code: 'SR0005', category: 'rings' },
      { id: 'SR0006', name: 'Designer Silver Set', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '6.2g', code: 'SR0006', category: 'rings' },
      { id: 'SR0007', name: 'Modern Silver Band', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '4.8g', code: 'SR0007', category: 'rings' },
      { id: 'SR0008', name: 'Antique Silver Ring', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '5.1g', code: 'SR0008', category: 'rings' },
      { id: 'SR0009', name: 'Contemporary Ring', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', minWeight: '3.9g', code: 'SR0009', category: 'rings' },
      { id: 'SR0010', name: 'Luxury Silver Ring', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '7.2g', code: 'SR0010', category: 'rings' },
    ],
    chains: [
      { id: 'SC0001', name: 'Sterling Silver Chain', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '12.0g', code: 'SC0001', category: 'chains' },
      { id: 'SC0002', name: 'Silver Cuban Chain', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', minWeight: '18.5g', code: 'SC0002', category: 'chains' },
      { id: 'SC0003', name: 'Silver Rope Chain', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '10.8g', code: 'SC0003', category: 'chains' },
      { id: 'SC0004', name: 'Box Chain Silver', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '14.2g', code: 'SC0004', category: 'chains' },
      { id: 'SC0005', name: 'Figaro Silver Chain', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '11.5g', code: 'SC0005', category: 'chains' },
      { id: 'SC0006', name: 'Snake Chain Silver', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '9.9g', code: 'SC0006', category: 'chains' },
      { id: 'SC0007', name: 'Silver Link Chain', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '16.3g', code: 'SC0007', category: 'chains' },
      { id: 'SC0008', name: 'Heavy Silver Chain', image: 'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=400&h=400&fit=crop', minWeight: '22.7g', code: 'SC0008', category: 'chains' },
    ],
    bangles: [
      { id: 'SB0001', name: 'Traditional Silver Bangle', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '20.2g', code: 'SB0001', category: 'bangles' },
      { id: 'SB0002', name: 'Sterling Silver Kada', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '28.8g', code: 'SB0002', category: 'bangles' },
      { id: 'SB0003', name: 'Carved Silver Bangle', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '24.5g', code: 'SB0003', category: 'bangles' },
      { id: 'SB0004', name: 'Oxidized Silver Bangle', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '26.1g', code: 'SB0004', category: 'bangles' },
      { id: 'SB0005', name: 'Modern Silver Bangle', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '18.3g', code: 'SB0005', category: 'bangles' },
      { id: 'SB0006', name: 'Heavy Silver Kada', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '42.7g', code: 'SB0006', category: 'bangles' },
    ],
    earrings: [
      { id: 'SE0001', name: 'Silver Drop Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '6.2g', code: 'SE0001', category: 'earrings' },
      { id: 'SE0002', name: 'Sterling Silver Studs', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '4.8g', code: 'SE0002', category: 'earrings' },
      { id: 'SE0003', name: 'Silver Hoop Earrings', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '8.1g', code: 'SE0003', category: 'earrings' },
      { id: 'SE0004', name: 'Silver Chandelier', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '12.5g', code: 'SE0004', category: 'earrings' },
      { id: 'SE0005', name: 'Traditional Silver Jhumka', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '10.3g', code: 'SE0005', category: 'earrings' },
      { id: 'SE0006', name: 'Modern Silver Earrings', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '5.9g', code: 'SE0006', category: 'earrings' },
    ],
    necklaces: [
      { id: 'SN0001', name: 'Traditional Silver Necklace', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '35.5g', code: 'SN0001', category: 'necklaces' },
      { id: 'SN0002', name: 'Silver Choker Necklace', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '28.2g', code: 'SN0002', category: 'necklaces' },
      { id: 'SN0003', name: 'Long Silver Necklace', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '42.8g', code: 'SN0003', category: 'necklaces' },
      { id: 'SN0004', name: 'Sterling Silver Set', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '32.1g', code: 'SN0004', category: 'necklaces' },
      { id: 'SN0005', name: 'Bridal Silver Necklace', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '55.7g', code: 'SN0005', category: 'necklaces' },
      { id: 'SN0006', name: 'Designer Silver Piece', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '38.9g', code: 'SN0006', category: 'necklaces' },
    ],
    pendants: [
      { id: 'SP0001', name: 'Designer Silver Pendant', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '5.8g', code: 'SP0001', category: 'pendants' },
      { id: 'SP0002', name: 'Sterling Silver Pendant', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '6.5g', code: 'SP0002', category: 'pendants' },
      { id: 'SP0003', name: 'Religious Silver Pendant', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '4.9g', code: 'SP0003', category: 'pendants' },
      { id: 'SP0004', name: 'Heart Silver Pendant', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '5.2g', code: 'SP0004', category: 'pendants' },
      { id: 'SP0005', name: 'Silver Locket Pendant', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '7.1g', code: 'SP0005', category: 'pendants' },
      { id: 'SP0006', name: 'Modern Silver Pendant', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '4.7g', code: 'SP0006', category: 'pendants' },
    ],
  };

  const getDisplayedProducts = (categoryId: string) => {
    const products = allProducts[categoryId] || [];
    const isShowingFull = showFullCollection[categoryId];
    return isShowingFull ? products : products.slice(0, 6);
  };

  const handleViewMore = (categoryId: string) => {
    if (!isLoggedIn) {
      showAuthModal();
      return;
    }
    setShowFullCollection(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleFavorite = (product: Product) => {
    // Favorites are now available for non-logged in users
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      showRemovedFromFavorites(product.name);
    } else {
      addToFavorites(product);
      showAddedToFavorites(product.name);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      showLoginRequired();
      showAuthModal();
      return;
    }
    addToCart(product);
    showAddedToCart(product.name);
  };

  const displayedProducts = getDisplayedProducts(selectedCategory);
  const hasMoreProducts = allProducts[selectedCategory]?.length > 6;
  const isShowingFull = showFullCollection[selectedCategory];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Silver Collection</h1>
          <p className="text-gray-600">Discover our exquisite collection of pure sterling silver jewellery</p>
        </div>

        {/* Mobile Category Dropdown */}
        <div className="lg:hidden mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Categories */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                      selectedCategory === category.id
                        ? 'bg-gray-50 text-gray-600 border border-gray-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Product Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{selectedCategory}</h2>
              <p className="text-gray-600 mt-1">
                {displayedProducts.length} of {allProducts[selectedCategory]?.length || 0} designs
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {displayedProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* Favorite button on image */}
                      <button
                        className={`absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                          isFavorite(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={() => handleFavorite(product)}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-700 hover:text-red-500'}`} />
                      </button>

                      {/* View button overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleProductClick(product)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3 lg:p-4">
                      <h3 className="font-semibold text-xs lg:text-sm mb-1 lg:mb-2">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 lg:mb-3">Min. Weight: {product.minWeight}</p>

                      <Button
                        size="sm"
                        className="w-full text-xs bg-gray-500 hover:bg-gray-600"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {hasMoreProducts && !isShowingFull && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleViewMore(selectedCategory)}
                  className="border-gray-500 text-gray-600 hover:bg-gray-50"
                >
                  View More Designs
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>{selectedProduct?.name || 'Product Details'}</DialogTitle>
          {selectedProduct && (
            <>
              <img 
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Product Code: <span className="font-semibold">{selectedProduct.code}</span></p>
                  <p className="text-gray-600">Minimum Weight: <span className="font-semibold">{selectedProduct.minWeight}</span></p>
                  <p className="text-sm text-gray-500 mt-2">
                    This beautiful sterling silver piece can be customized according to your requirements. 
                    The final weight and price will be confirmed upon order.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleFavorite(selectedProduct)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
