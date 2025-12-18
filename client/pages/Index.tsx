"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Eye,
  Heart,
  ShoppingBag,
  Star,
  Award,
  Shield,
  Sparkles,
  Crown,
  Gem,
  ArrowRight,
} from "lucide-react";

import Layout from "@/components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useToastNotifications } from "../hooks/use-toast-notifications";

interface Product {
  id: string;
  name: string;
  image: string; // mapped from image_url
  minWeight: string; // mapped from min_weight
  code: string;
  category: "ring" | "chain" | "earring" | "necklace" | "bracelet" | "pendant";
  created_at?: string;
}

// ---------- Helper to format INR numbers ----------
const formatINR = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  // format with Indian separators and 2 decimals
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

export default function Index() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [goldRate, setGoldRate] = useState<number | null>(null);
  const [silverRate, setSilverRate] = useState<number | null>(null);
  const [ratesLastUpdate, setRatesLastUpdate] = useState<string | null>(null); // ISO string
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isLoggedIn, showAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const {
    showAddedToCart,
    showAddedToFavorites,
    showRemovedFromFavorites,
    showLoginRequired,
  } = useToastNotifications();

  const banners = [
    {
      title: "Diwali Special Offer",
      subtitle: "Get 20% off on all gold jewellery",
      background: "bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600",
      pattern: "✨",
      cta: "Shop Gold Collection",
      link: "/gold",
    },
    {
      title: "Bridal Collection 2024",
      subtitle: "Exclusive designer sets for your special day",
      background: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-500",
      pattern: "👑",
      cta: "Explore Bridal Sets",
      link: "/gold",
    },
    {
      title: "Silver Elegance",
      subtitle: "Premium sterling silver - Buy 2 Get 1 Free",
      background: "bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600",
      pattern: "💎",
      cta: "Browse Silver",
      link: "/silver",
    },
  ];

  // -------------------------
  // Fetch new arrivals from Supabase
  // -------------------------
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoadingProducts(true);
      setFetchError(null);

      try {
        const { data, error } = await supabase
          .from("new_arrivals")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
          if (isMounted) setFetchError(error.message || "Failed to load products");
        } else if (data) {
          // map to Product[]
          const mapped = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            image: r.image_url || r.image || "", // fallback if column differs
            minWeight: r.min_weight || r.minWeight || "",
            code: r.code,
            category: (r.category as Product["category"]) || "pendant",
            created_at: r.created_at,
          })) as Product[];

          if (isMounted) setProducts(mapped);
        }
      } catch (err: any) {
        console.error("Unexpected fetch error:", err);
        if (isMounted) setFetchError(err.message || "Failed to load products");
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // -------------------------
  // Fetch latest rates from Supabase (market_rates table)
  // -------------------------
  useEffect(() => {
    let isMounted = true;
    let pollingTimer: NodeJS.Timeout | null = null;

    const fetchRates = async () => {
      try {
        // we pick the most recent row (order by updated_at desc limit 1)
        const { data, error } = await supabase
          .from("market_rates")
          .select("id, gold_rate, silver_rate, updated_at, note")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching market_rates:", error);
          return;
        }
        if (!data || data.length === 0) {
          // no rates configured yet
          if (isMounted) {
            setGoldRate(null);
            setSilverRate(null);
            setRatesLastUpdate(null);
          }
          return;
        }

        const row: any = data[0];
        if (isMounted) {
          setGoldRate(row.gold_rate !== null ? Number(row.gold_rate) : null);
          setSilverRate(row.silver_rate !== null ? Number(row.silver_rate) : null);
          setRatesLastUpdate(row.updated_at ? new Date(row.updated_at).toISOString() : null);
        }
      } catch (err) {
        console.error("Unexpected fetchRates error:", err);
      }
    };

    // initial fetch
    fetchRates();

    // poll every 30 seconds as a fallback
    pollingTimer = setInterval(() => {
      fetchRates();
    }, 30000);

    return () => {
      isMounted = false;
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, []);

  // -------------------------
  // Realtime subscription to market_rates (listen for inserts/updates)
  // -------------------------
  useEffect(() => {
    // subscribe to changes on market_rates
    const channel = supabase
      .channel("public:market_rates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_rates" },
        (payload: any) => {
          try {
            const ev = (payload as any).eventType?.toUpperCase();
            const r = payload.new ?? payload.old;
            if (!r) return;

            // For INSERT or UPDATE, update the UI
            if (ev === "INSERT" || ev === "UPDATE") {
              setGoldRate(r.gold_rate !== null ? Number(r.gold_rate) : null);
              setSilverRate(r.silver_rate !== null ? Number(r.silver_rate) : null);
              setRatesLastUpdate(r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString());
            } else if (ev === "DELETE") {
              // if the latest row was deleted, you might want to re-fetch
              // fetch latest row from table
              (async () => {
                const { data } = await supabase
                  .from("market_rates")
                  .select("id, gold_rate, silver_rate, updated_at")
                  .order("updated_at", { ascending: false })
                  .limit(1);
                if (data && data.length > 0) {
                  const nr: any = data[0];
                  setGoldRate(nr.gold_rate !== null ? Number(nr.gold_rate) : null);
                  setSilverRate(nr.silver_rate !== null ? Number(nr.silver_rate) : null);
                  setRatesLastUpdate(nr.updated_at ? new Date(nr.updated_at).toISOString() : new Date().toISOString());
                } else {
                  setGoldRate(null);
                  setSilverRate(null);
                  setRatesLastUpdate(null);
                }
              })();
            }
          } catch (e) {
            console.error("Realtime market_rates handler error:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -------------------------
  // Actions
  // -------------------------
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleFavorite = (product: Product) => {
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

  // format last update string
  const formattedLastUpdate = ratesLastUpdate
    ? new Date(ratesLastUpdate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Layout>
      {/* HERO */}
      <section className="relative h-96 md:h-[32rem] overflow-hidden">
        <div
          className={`w-full h-full flex items-center justify-center transition-all duration-1000 ${banners[currentBanner].background} relative`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-6xl animate-pulse">
              {banners[currentBanner].pattern}
            </div>
            <div className="absolute top-20 right-20 text-4xl animate-bounce delay-300">
              {banners[currentBanner].pattern}
            </div>
            <div className="absolute bottom-20 left-20 text-5xl animate-pulse delay-700">
              {banners[currentBanner].pattern}
            </div>
            <div className="absolute bottom-10 right-10 text-3xl animate-bounce delay-500">
              {banners[currentBanner].pattern}
            </div>
          </div>

          <div className="absolute inset-0 bg-black/20"></div>

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

        {/* indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${index === currentBanner ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/70"}`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>

        <div className="absolute bottom-6 right-6 text-white/70 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gray-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Market Rates</h2>
            <p className="text-gray-600 text-lg">Updated from server </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white border-0 text-base">Today</Badge>
                </div>

                <h3 className="text-2xl font-bold mb-3">Gold Rate Today</h3>
                <div className="mb-4">
                  <p className="text-4xl md:text-5xl font-bold">₹{formatINR(goldRate)}</p>
                  <p className="text-white/80 text-lg">per gram (22k)</p>
                </div>

                <div className="flex items-center text-white/80">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm">Certified 916 Hallmark</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white border-0 text-base">Today</Badge>
                </div>

                <h3 className="text-2xl font-bold mb-3">Silver Rate Today</h3>
                <div className="mb-4">
                  <p className="text-4xl md:text-5xl font-bold">₹{formatINR(silverRate)}</p>
                  <p className="text-white/80 text-lg">per gram</p>
                </div>

                <div className="flex items-center text-white/80">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm">Pure Silver</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Rates updated • Last update: {formattedLastUpdate}
            </p>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS (dynamic from Supabase) */}
      <section className="py-16 bg-white relative overflow-hidden">
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

          {loadingProducts ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading new arrivals…</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading products: {fetchError}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No new arrivals yet. Add from admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white relative">
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

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
          )}

          {/* View all collection button */}
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

      {/* TRUST + IG sections unchanged (kept concise) */}
      <section className="py-16 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full bg-yellow-400"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, transparent 20%, rgba(255,255,255,0.3) 21%),
                               radial-gradient(circle at 75% 75%, transparent 20%, rgba(255,255,255,0.3) 21%)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-2xl mb-6 relative">
                <Shield className="w-12 h-12 text-white" />
                <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping" />
                <div className="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-pulse" />
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

      {/* PRODUCT MODAL */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>{selectedProduct?.name || "Product Details"}</DialogTitle>
          {selectedProduct && (
            <>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">
                    Product Code: <span className="font-semibold">{selectedProduct.code}</span>
                  </p>
                  <p className="text-gray-600">
                    Minimum Weight: <span className="font-semibold">{selectedProduct.minWeight}</span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleFavorite(selectedProduct)}>
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600" onClick={() => handleAddToCart(selectedProduct)}>
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
