import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Eye, Heart, ShoppingBag, Star, TrendingUp, Award, Shield, Sparkles, Crown, Gem, ArrowRight, Play } from 'lucide-react';
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
  category: 'ring' | 'chain' | 'earring' | 'necklace' | 'bracelet' | 'pendant';
}

export default function Index() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [goldRate, setGoldRate] = useState(6420);
  const [silverRate, setSilverRate] = useState(82);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isLoggedIn, showAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { showAddedToCart, showAddedToFavorites, showRemovedFromFavorites, showLoginRequired } = useToastNotifications();

  const banners = [
    {
      title: "Diwali Special Offer",
      subtitle: "Get 20% off on all gold jewellery",
      background: "bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600",
      pattern: "✨",
      cta: "Shop Gold Collection",
      link: "/gold"
    },
    {
      title: "Bridal Collection 2024",
      subtitle: "Exclusive designer sets for your special day",
      background: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-500",
      pattern: "👑",
      cta: "Explore Bridal Sets",
      link: "/gold"
    },
    {
      title: "Silver Elegance",
      subtitle: "Premium sterling silver - Buy 2 Get 1 Free",
      background: "bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600",
      pattern: "💎",
      cta: "Browse Silver",
      link: "/silver"
    }
  ];

  const newArrivals: Product[] = [
    { id: 'R0001', name: 'Classic Diamond Ring', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop', minWeight: '2.5g', code: 'R0001', category: 'ring' },
    { id: 'C0001', name: 'Gold Chain Deluxe', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=300&h=300&fit=crop', minWeight: '8.0g', code: 'C0001', category: 'chain' },
    { id: 'E0001', name: 'Pearl Drop Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop', minWeight: '3.2g', code: 'E0001', category: 'earring' },
    { id: 'N0001', name: 'Traditional Necklace', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=300&h=300&fit=crop', minWeight: '15.5g', code: 'N0001', category: 'necklace' },
    { id: 'R0002', name: 'Emerald Ring Set', image: 'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=300&h=300&fit=crop', minWeight: '4.1g', code: 'R0002', category: 'ring' },
    { id: 'B0001', name: 'Gold Bracelet', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop', minWeight: '6.8g', code: 'B0001', category: 'bracelet' },
    { id: 'P0001', name: 'Designer Pendant', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop', minWeight: '2.8g', code: 'P0001', category: 'pendant' },
    { id: 'C0002', name: 'Silver Chain Classic', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=300&fit=crop', minWeight: '5.5g', code: 'C0002', category: 'chain' },
  ];

  const instagramPosts = [
    'https://images.unsplash.com/photo-1588444837495-d6fcc2b05da0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1603561596112-db532d74f50d?w=200&h=200&fit=crop',
  ];

  // Banner rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Mock rate updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGoldRate(prev => prev + (Math.random() - 0.5) * 10);
      setSilverRate(prev => prev + (Math.random() - 0.5) * 2);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <Layout>
      {/* Enhanced Hero Banner */}
      <section className="relative h-96 md:h-[32rem] overflow-hidden">
        <div
          className={`w-full h-full flex items-center justify-center transition-all duration-1000 ${banners[currentBanner].background} relative`}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-6xl animate-pulse">{banners[currentBanner].pattern}</div>
            <div className="absolute top-20 right-20 text-4xl animate-bounce delay-300">{banners[currentBanner].pattern}</div>
            <div className="absolute bottom-20 left-20 text-5xl animate-pulse delay-700">{banners[currentBanner].pattern}</div>
            <div className="absolute bottom-10 right-10 text-3xl animate-bounce delay-500">{banners[currentBanner].pattern}</div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Content */}
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <div className="mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Limited Time Offer
              </Badge>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                {banners[currentBanner].title}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {banners[currentBanner].subtitle}
            </p>
          </div>
        </div>

        {/* Enhanced Banner indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentBanner
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 right-6 text-white/70 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Gold and Silver Rates */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gray-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Market Rates</h2>
            <p className="text-gray-600 text-lg">Updated every 30 seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Gold Rate Card */}
            <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>

                <h3 className="text-2xl font-bold mb-3">Gold Rate Today</h3>
                <div className="mb-4">
                  <p className="text-4xl md:text-5xl font-bold">₹{goldRate.toFixed(0)}</p>
                  <p className="text-white/80 text-lg">per gram (24K)</p>
                </div>

                <div className="flex items-center text-white/80">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm">Certified 916 Hallmark</span>
                </div>
              </CardContent>
            </Card>

            {/* Silver Rate Card */}
            <Card className="bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>

                <h3 className="text-2xl font-bold mb-3">Silver Rate Today</h3>
                <div className="mb-4">
                  <p className="text-4xl md:text-5xl font-bold">₹{silverRate.toFixed(0)}</p>
                  <p className="text-white/80 text-lg">per gram</p>
                </div>

                <div className="flex items-center text-white/80">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm">Pure Sterling Silver</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rate update info */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Rates updated automatically • Last update: Just now
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced New Arrivals */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 mb-4 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Fresh Arrivals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              New <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">Arrivals</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Discover our latest collection of exquisite handcrafted jewellery pieces
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product, index) => (
              <div
                key={product.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white relative">
                  {/* Product badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 text-xs">
                      NEW
                    </Badge>
                  </div>

                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-lg"
                          onClick={() => handleProductClick(product)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500/90 text-white hover:bg-red-500 backdrop-blur-sm shadow-lg"
                          onClick={() => handleFavorite(product)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Sparkle effects */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>

                  <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50">
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Min. Weight: {product.minWeight}</p>
                        <Badge variant="outline" className="text-xs">
                          {product.code}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* View all button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
            >
              View All Collection
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Trust Message */}
      <section className="py-16 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-yellow-400"
               style={{
                 backgroundImage: `radial-gradient(circle at 25% 25%, transparent 20%, rgba(255,255,255,0.3) 21%),
                                  radial-gradient(circle at 75% 75%, transparent 20%, rgba(255,255,255,0.3) 21%)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon with animation */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-2xl mb-6 relative">
                <Shield className="w-12 h-12 text-white" />

                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping"></div>
                <div className="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-pulse"></div>
              </div>
            </div>

            <Badge className="bg-green-100 text-green-800 border-green-200 mb-6 px-4 py-2 text-sm">
              <Award className="w-4 h-4 mr-2" />
              Certified & Trusted
            </Badge>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Promise</span> to You
            </h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-200">
              <p className="text-2xl md:text-3xl text-gray-800 font-bold mb-4">
                We only deal with <span className="text-yellow-600">916 hallmark</span> ornaments
              </p>

              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                Every piece of jewellery is certified and hallmarked, ensuring you get authentic,
                high-quality gold and silver ornaments that retain their value and purity.
                Your trust is our treasure.
              </p>

              {/* Trust indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">BIS Certified</p>
                    <p className="text-sm text-gray-600">Government Approved</p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">100% Pure</p>
                    <p className="text-sm text-gray-600">Quality Guaranteed</p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">5 Star Rated</p>
                    <p className="text-sm text-gray-600">Customer Trusted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Instagram Grid */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 mb-4 px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Social Gallery
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Follow Us on
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> Instagram</span>
            </h2>

            <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-8">
              See our latest designs, happy customers, and behind-the-scenes moments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {instagramPosts.map((post, index) => (
              <div
                key={index}
                className="aspect-square relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src={post}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                  {/* Instagram icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Sparkle effect */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="mr-3">📸</span>
              Follow @elitejewels
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-gray-500 mt-4 text-sm">
              Join 50K+ followers for daily jewelry inspiration
            </p>
          </div>
        </div>
      </section>

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
