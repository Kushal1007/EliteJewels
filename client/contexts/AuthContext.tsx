import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  showAuthModal: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  demoLogin: () => void;
  user: { name: string; email: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const login = () => {
    setIsLoggedIn(true);
    setAuthModalOpen(false);
  };

  const demoLogin = () => {
    setIsLoggedIn(true);
    setUser({ name: 'Demo User', email: 'demo@elitejewels.com' });
    setAuthModalOpen(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAuthModalOpen(false);
  };

  const showAuthModal = () => {
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      login,
      logout,
      showAuthModal,
      authModalOpen,
      setAuthModalOpen,
      demoLogin,
      user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
