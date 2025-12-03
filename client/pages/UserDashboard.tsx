"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, Package, Heart, Clock, CheckCircle, Truck, 
  MessageCircle, LogOut 
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCart } from "../contexts/CartContext";
import { supabase } from "@/lib/supabaseClient";

/**
 * UserDashboard (enhanced)
 * - Shows items with bigger images
 * - Displays per-item rate if present (item.rate)
 * - Displays order total derived from advancePaid + balanceAmount when available
 * - Shows countdown days until estimatedDelivery
 * - Still reads orders only (admin must add orders manually)
 */

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  // ensure we parse ISO or 'YYYY-MM-DD'
  const d = new Date(dateStr);
  // normalize to date-only comparison
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dt = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((dt - t) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function UserDashboard() {
  const { user, isLoggedIn, logout } = useAuth();
  const { favorites } = useFavorites();
  const { addToCart } = useCart();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", user.id)
        .single();

      if (!error && data) setProfile(data);
      else if (error) console.error("fetch profile error", error);
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!profile?.email) {
        setOrders([]);
        return;
      }

      setLoadingOrders(true);

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_email", profile.email)
          .order("orderdate", { ascending: false });

        if (error) {
          console.error("orders fetch error", error);
          setOrders([]);
          setLoadingOrders(false);
          return;
        }

        const mapped = (data || []).map((row: any) => {
          // map DB columns to camelCase UI fields
          const mappedItems = Array.isArray(row.items) ? row.items.map((it: any, idx: number) => ({
            id: it.id ?? `${row.id || "o"}-${idx}`,
            name: it.name ?? it.title ?? "Item",
            code: it.code ?? null,
            image: it.image ?? null,
            quantity: it.quantity ?? 1,
            // optional: item-level rate if stored inside items (e.g. it.rate)
            rate: it.rate ?? it.price ?? null,
            minWeight: it.min_weight ?? it.minWeight ?? null,
          })) : [];

          // compute order total if possible
          const advance = row.advancepaid ?? row.advancePaid ?? null;
          const balance = row.balanceamount ?? row.balanceAmount ?? null;
          const totalPrice = (advance !== null && balance !== null) ? Number(advance) + Number(balance) : null;

          return {
            id: row.id,
            items: mappedItems,
            totalWeight: row.totalweight ?? row.totalWeight ?? null,
            advancePaid: advance,
            balanceAmount: balance,
            totalPrice,
            estimatedDelivery: row.estimateddelivery ?? row.estimatedDelivery ?? null,
            notes: row.notes ?? null,
            status: row.status ?? "pending",
            orderDate: row.orderdate ?? row.orderDate ?? null,
            __raw: row,
          };
        });

        setOrders(mapped);
      } catch (err) {
        console.error("fetchUserOrders unexpected error", err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [profile?.email]);

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Please login to view your dashboard</p>
        </div>
      </Layout>
    );
  }

  const userOrders = orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-purple-100 text-purple-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "in-progress": return <Package className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "delivered": return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {loadingProfile ? "Loading..." : profile?.name || "No Name"}
                </h1>
                <p className="text-gray-600">{profile?.email || "No email"}</p>
                <p className="text-gray-600">📞 {profile?.phone}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {loadingOrders ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading orders...</p>
                </CardContent>
              </Card>
            ) : userOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400 mt-2">Place an order via WhatsApp and wait for confirmation from the shop.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => {
                  const days = daysUntil(order.estimatedDelivery);
                  let countdownLabel = "TBD";
                  if (days === null) countdownLabel = "TBD";
                  else if (days < 0) countdownLabel = "Ready";
                  else if (days === 0) countdownLabel = "Due today";
                  else countdownLabel = `${days} day${days > 1 ? "s" : ""} left`;

                  return (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <div className="flex items-center space-x-3">
                            <div className="text-right text-sm">
                              <div className="text-gray-500">Delivery</div>
                              <div className="font-semibold">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "TBD"}</div>
                              <div className="text-xs text-gray-400">{countdownLabel}</div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Unknown"}
                        </p>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={item.image || "/placeholder.png"}
                                  alt={item.name}
                                  className="w-20 h-20 md:w-32 md:h-32 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    {item.rate != null && (
                                      <div className="text-sm font-semibold">₹{Number(item.rate).toLocaleString()}</div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">Code: {item.code || "-"}</p>
                                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} {item.minWeight ? `• Min: ${item.minWeight}` : ""}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Total Weight</p>
                              <p className="font-semibold">{order.totalWeight ?? "-"}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Advance Paid</p>
                              <p className="font-semibold">₹{order.advancePaid ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Balance</p>
                              <p className="font-semibold">₹{order.balanceAmount ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Estimated Delivery</p>
                              <p className="font-semibold">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}</p>
                            </div>
                          </div>

                          {/* Order total row */}
                          <div className="flex items-center justify-end">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Order Total</div>
                              <div className="text-lg font-bold">₹{order.totalPrice != null ? Number(order.totalPrice).toLocaleString() : "—"}</div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{order.notes}</p>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const message = `Hi! I'd like to check the status of my order #${order.id}`;
                              window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact About Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No favorites yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add items to your favorites to see them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Code: {item.code}</p>
                      <p className="text-sm text-gray-600 mb-4">Min. Weight: {item.minWeight}</p>
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
