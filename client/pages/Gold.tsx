"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useToastNotifications } from "../hooks/use-toast-notifications";
import { supabase } from "../lib/supabaseClient";

interface Product {
  id: string;
  name: string;
  image_url: string;
  min_weight: number;
  product_code: string;
  main_category: string;
  sub_category?: string;
  style?: string;
  actual_weight?: number;
  created_at?: string;
}

interface SubCat {
  id: string;
  name: string;
}

interface MainCat {
  id: string;
  name: string;
  subCategories?: SubCat[];
}

export default function Gold() {
  const [selectedMainCategory, setSelectedMainCategory] = useState("rings");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>("men");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ rings: true });
  const [showFullCollection, setShowFullCollection] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const { isLoggedIn, showAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { showAddedToCart, showAddedToFavorites, showRemovedFromFavorites, showLoginRequired } =
    useToastNotifications();

  // 🟡 Updated categories
  const categories: MainCat[] = [
    { id: "chains", name: "Chains" },
    { id: "earrings", name: "Earrings" },
    {
      id: "rings",
      name: "Rings",
      subCategories: [
        { id: "men", name: "Men" },
        { id: "women", name: "Women" },
      ],
    },
    { id: "haara", name: "Haara" },
    { id: "necklace", name: "Necklace" },
    {
      id: "bracelet",
      name: "Bracelet",
      subCategories: [
        { id: "men", name: "Men" },
        { id: "women", name: "Women" },
        { id: "kids", name: "Kids" },
      ],
    },
  ];

  // 🎨 Category-specific styles
  const categoryStyles: Record<string, string[]> = {
    chains: ["all", "box", "cable", "rope", "fancy"],
    earrings: ["all", "stud", "hangings", "antique jhumka", ""],
    rings: ["all", "single stone", "plain", "couple", "fancy"],
    haara: ["all", "traditional", "temple", "modern"],
    necklace: ["all", "choker", "long", "temple", "designer"],
    bracelet: ["all", "plain", "charm", "link", "fancy"],
  };

  // 🟩 Height function for each category
  const getImageHeight = (category: string) => {
    switch (category.toLowerCase()) {
      case "chains":
      case "haara":
      case "necklace":
      case "bracelet":
        return "h-80 sm:h-96"; // taller images
      case "rings":
      case "earrings":
        return "h-64 sm:h-72"; // medium height
      default:
        return "h-72"; // fallback
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let builder: any = supabase
          .from("products")
          .select("*")
          .eq("material", "gold")
          .order("created_at", { ascending: false });

        if (selectedMainCategory) {
          builder = builder.eq("main_category", selectedMainCategory);
        }
        if (selectedSubCategory) {
          builder = builder.eq("sub_category", selectedSubCategory);
        }
        if (selectedStyle && selectedStyle !== "all") {
          builder = builder.eq("style", selectedStyle);
        }

        const { data, error } = await builder;
        if (error) {
          console.error("Error fetching products:", error.message || error);
        } else {
          setProducts((data as Product[]) || []);
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      }
    };

    fetchProducts();
  }, [selectedMainCategory, selectedSubCategory, selectedStyle]);

  const getDisplayedProducts = () => {
    const key = `${selectedMainCategory}-${selectedSubCategory || "all"}-${selectedStyle}`;
    const isShowingFull = showFullCollection[key];
    return isShowingFull ? products : products.slice(0, 6);
  };

  const handleViewMore = () => {
    if (!isLoggedIn) {
      showAuthModal();
      return;
    }
    const key = `${selectedMainCategory}-${selectedSubCategory || "all"}-${selectedStyle}`;
    setShowFullCollection((prev) => ({ ...prev, [key]: true }));
  };

  const handleProductClick = (product: Product) => setSelectedProduct(product);

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

  const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const displayedProducts = getDisplayedProducts();
  const hasMoreProducts = products.length > 6;
  const isShowingFull =
    showFullCollection[`${selectedMainCategory}-${selectedSubCategory || "all"}-${selectedStyle}`];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {capitalize(selectedMainCategory)} Collection
          </h1>
          <p className="text-gray-600">
            {selectedStyle === "all"
              ? `${displayedProducts.length} of ${products.length} designs`
              : `${capitalize(selectedStyle)} — ${displayedProducts.length} of ${products.length} designs`}
          </p>
        </div>

        {/* 📱 Mobile Category Dropdown */}
        <div className="lg:hidden mb-6">
          <Select
            value={`${selectedMainCategory}-${selectedSubCategory || "all"}`}
            onValueChange={(val) => {
              const [main, sub] = val.split("-");
              setSelectedMainCategory(main);
              setSelectedSubCategory(sub === "all" ? null : sub);
              setSelectedStyle("all");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category">
                {categories.find((cat) => cat.id === selectedMainCategory)?.name}
                {selectedSubCategory ? ` — ${capitalize(selectedSubCategory)}` : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <SelectItem value={`${cat.id}-all`}>{cat.name}</SelectItem>
                  {cat.subCategories &&
                    cat.subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={`${cat.id}-${sub.id}`}>
                        {cat.name} — {sub.name}
                      </SelectItem>
                    ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedMainCategory(cat.id);
                        if (cat.subCategories && cat.subCategories.length > 0) {
                          setSelectedSubCategory(cat.subCategories[0].id);
                        } else {
                          setSelectedSubCategory(null);
                        }
                        setSelectedStyle("all");
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                        selectedMainCategory === cat.id
                          ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                    {cat.subCategories && (
                      <div className="ml-4 mt-2 space-y-1">
                        {cat.subCategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedMainCategory(cat.id);
                              setSelectedSubCategory(sub.id);
                              setSelectedStyle("all");
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                              selectedSubCategory === sub.id &&
                              selectedMainCategory === cat.id
                                ? "bg-yellow-100 text-yellow-700"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Style Filters */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              {(categoryStyles[selectedMainCategory] || ["all"]).map((s) => {
                const active = selectedStyle === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`px-4 py-2 rounded-full border shadow-sm whitespace-nowrap text-sm ${
                      active
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {capitalize(s)}
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {displayedProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div
                      className={`relative w-full ${getImageHeight(
                        product.main_category
                      )} overflow-hidden rounded-xl`}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        className={`absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                          isFavorite(product.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={() => handleFavorite(product)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorite(product.id)
                              ? "text-red-500 fill-red-500"
                              : "text-gray-700 hover:text-red-500"
                          }`}
                        />
                      </button>
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
                      <h3 className="font-semibold text-xs lg:text-sm mb-1 lg:mb-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 lg:mb-3">
                        Min. Weight: {product.min_weight}g
                      </p>
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

            {hasMoreProducts && !isShowingFull && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleViewMore}
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
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogTitle>{selectedProduct?.name || "Product Details"}</DialogTitle>
          {selectedProduct && (
            <>
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg mb-4 mx-auto"
              />
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">
                    Product Code:{" "}
                    <span className="font-semibold">{selectedProduct.product_code}</span>
                  </p>
                  <p className="text-gray-600">
                    Minimum Weight:{" "}
                    <span className="font-semibold">{selectedProduct.min_weight}g</span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleFavorite(selectedProduct)}
                  >
                    <Heart className="w-4 h-4 mr-2" /> Add to Favorites
                  </Button>
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => handleAddToCart(selectedProduct)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
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
