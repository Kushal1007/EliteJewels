import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, Menu, X, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';
import FavoritesSidebar from './FavoritesSidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, authModalOpen, setAuthModalOpen, showAuthModal, login, demoLogin, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Gold', href: '/gold', current: location.pathname === '/gold' },
    { name: 'Silver', href: '/silver', current: location.pathname === '/silver' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EliteJewels</span>
              </div>
            </Link>

            {/* Auth buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FavoritesSidebar />
                {isLoggedIn && <CartSidebar />}
                {isLoggedIn ? (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="p-2">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 ml-2">
                    <Button variant="outline" size="sm" onClick={showAuthModal}>
                      Login
                    </Button>
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={showAuthModal}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Auth */}
                  <div className="pb-4 border-b">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      <FavoritesSidebar />
                      {isLoggedIn && <CartSidebar />}
                      {isLoggedIn && (
                        <Link to="/dashboard">
                          <Button variant="ghost" size="sm" className="p-2">
                            <User className="w-5 h-5" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    {!isLoggedIn && (
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" onClick={showAuthModal}>
                          Login
                        </Button>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={showAuthModal}>
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          item.current
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden md:flex space-x-8 justify-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    item.current
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-yellow-600 hover:border-yellow-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Shop Note */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EliteJewels</span>
              </div>
              <p className="text-gray-300 mb-4">
                Your trusted destination for authentic 916 hallmark gold and silver jewellery. 
                We bring you exquisite designs crafted with precision and love, ensuring every piece 
                tells a story of elegance and tradition.
              </p>
              {/* Newsletter */}
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-yellow-400">Shop</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-yellow-400">About</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-yellow-400">Contact</Link></li>
                <li><Link to="/faq" className="text-gray-300 hover:text-yellow-400">FAQ</Link></li>
                <li><Link to="/return-policy" className="text-gray-300 hover:text-yellow-400">Return Policy</Link></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>📞 +91 98765 43210</p>
                <p>📱 +91 98765 43210</p>
                <p>✉️ info@elitejewels.com</p>
                <p>📍 123 Jewellery Street, Mumbai, India</p>
                <div className="flex space-x-3 mt-4">
                  <a href="#" className="text-gray-300 hover:text-yellow-400">Facebook</a>
                  <a href="#" className="text-gray-300 hover:text-yellow-400">Instagram</a>
                  <a href="#" className="text-gray-300 hover:text-yellow-400">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 EliteJewels. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
        onDemoLogin={demoLogin}
      />
    </div>
  );
}
