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
 * Responsive UserDashboard
 * - displays phone above email
 * - fetches orders by phone (if available) then falls back to email
 * - mobile layout preserved; desktop uses a two-column layout with a left sidebar
 */

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr);
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dt = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((dt - t) / (1000 * 60 * 60 * 24));
  return diff;
}

const formatINR = (v: number | null | undefined) => {
  if (v == null || isNaN(Number(v))) return "—";
  return new Intl.NumberFormat("en-IN").format(Number(v));
};

const shortOrderId = (row: any) => {
  if (!row) return "";
  if (row.ref) return row.ref;
  const id = String(row.id ?? "");
  return id.length <= 10 ? id : `#${id.slice(-8)}`;
};

export default function UserDashboard() {
  const { user, isLoggedIn, logout } = useAuth();
  const { favorites } = useFavorites();
  const { addToCart } = useCart();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // fetch profile
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

  // fetch orders — prefer phone if available, otherwise email
  useEffect(() => {
    const fetchUserOrders = async () => {
      const phone = profile?.phone;
      const email = profile?.email;

      if (!phone && !email) {
        setOrders([]);
        return;
      }

      setLoadingOrders(true);

      try {
        // if phone exists query user_phone, else use user_email
        let query = supabase.from("orders").select("*").order("orderdate", { ascending: false });

        if (phone) {
          // try by phone first
          query = query.eq("user_phone", phone);
        } else {
          query = query.eq("user_email", email);
        }

        const { data, error } = await query;

        if (error) {
          console.error("orders fetch error", error);
          // If phone query returned empty or error, try fallback to email (defensive)
          if (phone && email) {
            const { data: fallback, error: fallbackErr } = await supabase
              .from("orders")
              .select("*")
              .eq("user_email", email)
              .order("orderdate", { ascending: false });

            if (!fallbackErr && fallback) {
              mapAndSetOrders(fallback);
            } else {
              console.error("orders fetch fallback error", fallbackErr);
              setOrders([]);
            }
          } else {
            setOrders([]);
          }
          setLoadingOrders(false);
          return;
        }

        mapAndSetOrders(data || []);
      } catch (err) {
        console.error("fetchUserOrders unexpected error", err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [profile?.phone, profile?.email]);

  function mapAndSetOrders(data: any[]) {
    const mapped = (data || []).map((row: any) => {
      const mappedItems = Array.isArray(row.items) ? row.items.map((it: any, idx: number) => ({
        id: it.id ?? `${row.id || "o"}-${idx}`,
        name: it.name ?? it.title ?? "Item",
        code: it.code ?? null,
        image: it.image ?? null,
        quantity: it.quantity ?? 1,
        rate: it.rate ?? it.price ?? null,
        minWeight: it.min_weight ?? it.minWeight ?? null,
      })) : [];

      const advance = row.advancepaid ?? row.advancePaid ?? null;
      const balance = row.balanceamount ?? row.balanceAmount ?? null;
      const totalPrice = (advance !== null && balance !== null) ? Number(advance) + Number(balance) : (row.totalprice ?? null);

      return {
        id: row.id,
        ref: row.ref ?? null,
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
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop: two-column layout. Mobile: single column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar: user info + stats */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {loadingProfile ? "Loading..." : profile?.name || "No Name"}
                  </div>
                  {/* show phone above email */}
                  <div className="text-sm text-gray-600">{profile?.phone ? profile.phone : "No phone"}</div>
                  <div className="text-sm text-gray-500">{profile?.email || "No email"}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Orders</div>
                  <div className="text-lg font-semibold">{userOrders.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Favorites</div>
                  <div className="text-lg font-semibold">{favorites.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Active</div>
                  <div className="text-lg font-semibold">{userOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex-1 text-sm text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="text-sm"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* On large screens show a quick list of recent orders summary */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {userOrders.slice(0, 5).length === 0 ? (
                    <div className="text-sm text-gray-500">No recent orders</div>
                  ) : (
                    <ul className="space-y-3">
                      {userOrders.slice(0, 5).map((o) => (
                        <li key={o.id} className="border rounded p-3">
                          <div className="text-sm text-gray-600">Ref: <strong>{o.ref}</strong></div>
                          <div className="text-sm text-gray-600">Total: <strong>₹{o.totalPrice ? formatINR(o.totalPrice) : "-"}</strong></div>
                          <div className="text-xs text-gray-400">Placed: {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "-"}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content: tabs, orders, favorites */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow p-4">
              <Tabs defaultValue="orders" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="orders">My Orders</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                  {loadingOrders ? (
                    <div className="text-center py-10 text-gray-500">Loading orders...</div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Package className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                      <div>No orders yet</div>
                      <div className="text-sm text-gray-400 mt-2">Place an order via WhatsApp and wait for confirmation from the shop.</div>
                    </div>
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
                          <article key={order.id} className="bg-white shadow-sm rounded-lg overflow-hidden border">
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm text-gray-500">Order</div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-base font-semibold">{shortOrderId(order)}</div>
                                    <Badge className={`${getStatusColor(order.status)} text-xs py-1 px-2 rounded-full`}>{order.status}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Unknown"}</div>
                                </div>

                                <div className="text-right">
                                  <div className="text-xs text-gray-500">Delivery</div>
                                  <div className="font-medium">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "TBD"}</div>
                                  <div className="text-xs text-gray-400">{countdownLabel}</div>
                                </div>
                              </div>

                              {/* Items */}
                              <div className="mt-3 border rounded p-3 bg-gray-50">
                                {order.items.map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-3 py-2">
                                    <img
                                      src={item.image || "/placeholder.png"}
                                      alt={item.name}
                                      className="w-24 h-24 md:w-28 md:h-28 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-sm">{item.name}</div>
                                          <div className="text-xs text-gray-500 mt-1">Code: {item.code || "-"}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-semibold">₹{item.rate != null ? formatINR(item.rate) : "—"}</div>
                                          <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* summary */}
                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="text-xs text-gray-500">Total Weight</div>
                                  <div className="font-medium">{order.totalWeight ?? "-"}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Order Total</div>
                                  <div className="font-semibold text-lg">₹{order.totalPrice != null ? formatINR(order.totalPrice) : "—"}</div>
                                </div>

                                <div>
                                  <div className="text-xs text-gray-500">Advance Paid</div>
                                  <div className="font-medium">₹{order.advancePaid != null ? formatINR(order.advancePaid) : "0"}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Balance</div>
                                  <div className="font-medium">₹{order.balanceAmount != null ? formatINR(order.balanceAmount) : "0"}</div>
                                </div>
                              </div>

                              {order.notes && <div className="mt-3 p-3 bg-white rounded text-sm text-gray-700 border">{order.notes}</div>}

                              <div className="mt-3 flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const message = `Hi! I'd like to check the status of my order ${shortOrderId(order)}`;
                                    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
                                  }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 border rounded py-2 text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Contact About Order
                                </button>

                                <button
                                  onClick={() => {
                                    // copy full id to clipboard
                                    navigator.clipboard?.writeText(String(order.__raw?.id ?? order.id));
                                    alert("Order id copied");
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 border rounded text-sm"
                                  title="Copy order id"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4">
                  {favorites.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <Heart className="mx-auto w-10 h-10 text-gray-300 mb-3" />
                      <div>No favorites yet</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favorites.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-3">
                            <div className="flex flex-col">
                              <img src={item.image} alt={item.name} className="w-full h-44 object-cover rounded mb-3" />
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-gray-500">Code: {item.code}</div>
                              <div className="mt-3">
                                <Button className="w-full bg-yellow-500 hover:bg-yellow-600" onClick={() => addToCart(item)}>Add to Cart</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
