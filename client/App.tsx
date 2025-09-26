import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Gold from "./pages/Gold";
import Silver from "./pages/Silver";
import Contact from "./pages/Contact";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrdersProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/gold" element={<Gold />} />
                  <Route path="/silver" element={<Silver />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OrdersProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
