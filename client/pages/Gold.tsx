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

export default function Gold() {
  const [selectedCategory, setSelectedCategory] = useState('rings');
  const [showFullCollection, setShowFullCollection] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isLoggedIn, showAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { showAddedToCart, showAddedToFavorites, showRemovedFromFavorites, showLoginRequired } = useToastNotifications();

  const categories: Category[] = [
    { id: 'rings', name: 'Rings', code: 'R' },
    { id: 'chains', name: 'Chains', code: 'C' },
    { id: 'bangles', name: 'Bangles', code: 'B' },
    { id: 'earrings', name: 'Earrings', code: 'E' },
    { id: 'necklaces', name: 'Necklaces', code: 'N' },
    { id: 'pendants', name: 'Pendants', code: 'P' },
  ];

  // Mock product data - in a real app this would come from an API
  const allProducts: Record<string, Product[]> = {
    rings: [
      { id: 'R0001', name: 'Classic Diamond Ring', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '2.5g', code: 'R0001', category: 'rings' },
      { id: 'R0002', name: 'Emerald Engagement Ring', image: 'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=400&h=400&fit=crop', minWeight: '3.2g', code: 'R0002', category: 'rings' },
      { id: 'R0003', name: 'Gold Band Ring', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '4.1g', code: 'R0003', category: 'rings' },
      { id: 'R0004', name: 'Ruby Statement Ring', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '3.8g', code: 'R0004', category: 'rings' },
      { id: 'R0005', name: 'Vintage Gold Ring', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '2.9g', code: 'R0005', category: 'rings' },
      { id: 'R0006', name: 'Designer Ring Set', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '5.2g', code: 'R0006', category: 'rings' },
      { id: 'R0007', name: 'Platinum Band Ring', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '3.5g', code: 'R0007', category: 'rings' },
      { id: 'R0008', name: 'Antique Gold Ring', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '4.3g', code: 'R0008', category: 'rings' },
      { id: 'R0009', name: 'Modern Diamond Ring', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', minWeight: '2.7g', code: 'R0009', category: 'rings' },
      { id: 'R0010', name: 'Luxury Ring Collection', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '6.1g', code: 'R0010', category: 'rings' },
    ],
    chains: [
      { id: 'C0001', name: 'Gold Chain Deluxe', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '8.0g', code: 'C0001', category: 'chains' },
      { id: 'C0002', name: 'Cuban Link Chain', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', minWeight: '12.5g', code: 'C0002', category: 'chains' },
      { id: 'C0003', name: 'Rope Chain Classic', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '6.8g', code: 'C0003', category: 'chains' },
      { id: 'C0004', name: 'Box Chain Premium', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '9.2g', code: 'C0004', category: 'chains' },
      { id: 'C0005', name: 'Figaro Chain Design', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '7.5g', code: 'C0005', category: 'chains' },
      { id: 'C0006', name: 'Snake Chain Elegant', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '5.9g', code: 'C0006', category: 'chains' },
      { id: 'C0007', name: 'Herringbone Chain', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '11.3g', code: 'C0007', category: 'chains' },
      { id: 'C0008', name: 'Miami Cuban Chain', image: 'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=400&h=400&fit=crop', minWeight: '15.7g', code: 'C0008', category: 'chains' },
    ],
    bangles: [
      { id: 'B0001', name: 'Traditional Gold Bangle', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '15.2g', code: 'B0001', category: 'bangles' },
      { id: 'B0002', name: 'Designer Kada', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '22.8g', code: 'B0002', category: 'bangles' },
      { id: 'B0003', name: 'Carved Bangle Set', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '18.5g', code: 'B0003', category: 'bangles' },
      { id: 'B0004', name: 'Antique Bangle', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '20.1g', code: 'B0004', category: 'bangles' },
      { id: 'B0005', name: 'Modern Slim Bangle', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '12.3g', code: 'B0005', category: 'bangles' },
      { id: 'B0006', name: 'Heavy Gold Kada', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '35.7g', code: 'B0006', category: 'bangles' },
    ],
    earrings: [
      { id: 'E0001', name: 'Pearl Drop Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '4.2g', code: 'E0001', category: 'earrings' },
      { id: 'E0002', name: 'Diamond Studs', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '2.8g', code: 'E0002', category: 'earrings' },
      { id: 'E0003', name: 'Gold Hoop Earrings', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '6.1g', code: 'E0003', category: 'earrings' },
      { id: 'E0004', name: 'Chandelier Earrings', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '8.5g', code: 'E0004', category: 'earrings' },
      { id: 'E0005', name: 'Jhumka Traditional', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '7.3g', code: 'E0005', category: 'earrings' },
      { id: 'E0006', name: 'Modern Ear Cuffs', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '3.9g', code: 'E0006', category: 'earrings' },
    ],
    necklaces: [
      { id: 'N0001', name: 'Traditional Necklace', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop', minWeight: '25.5g', code: 'N0001', category: 'necklaces' },
      { id: 'N0002', name: 'Choker Necklace', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '18.2g', code: 'N0002', category: 'necklaces' },
      { id: 'N0003', name: 'Long Gold Necklace', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '32.8g', code: 'N0003', category: 'necklaces' },
      { id: 'N0004', name: 'Pearl Necklace Set', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '22.1g', code: 'N0004', category: 'necklaces' },
      { id: 'N0005', name: 'Bridal Necklace', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '45.7g', code: 'N0005', category: 'necklaces' },
      { id: 'N0006', name: 'Designer Statement', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '28.9g', code: 'N0006', category: 'necklaces' },
    ],
    pendants: [
      { id: 'P0001', name: 'Designer Pendant', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', minWeight: '3.8g', code: 'P0001', category: 'pendants' },
      { id: 'P0002', name: 'Diamond Pendant', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', minWeight: '4.5g', code: 'P0002', category: 'pendants' },
      { id: 'P0003', name: 'Religious Pendant', image: 'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=400&h=400&fit=crop', minWeight: '2.9g', code: 'P0003', category: 'pendants' },
      { id: 'P0004', name: 'Heart Shaped Pendant', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', minWeight: '3.2g', code: 'P0004', category: 'pendants' },
      { id: 'P0005', name: 'Locket Pendant', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', minWeight: '5.1g', code: 'P0005', category: 'pendants' },
      { id: 'P0006', name: 'Modern Geometric', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&h=400&fit=crop', minWeight: '2.7g', code: 'P0006', category: 'pendants' },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gold Collection</h1>
          <p className="text-gray-600">Discover our exquisite collection of 916 hallmark gold jewellery</p>
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
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-yellow-600'
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
                        className="w-full text-xs bg-yellow-500 hover:bg-yellow-600"
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
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
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
                    This beautiful piece can be customized according to your requirements.
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
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
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
