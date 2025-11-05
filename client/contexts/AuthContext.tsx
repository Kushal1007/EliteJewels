import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  showAuthModal: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  user: { id: string; name: string | null; email: string | null; phone: string | null } | null;
  setUser: (user: AuthContextType['user']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  // Call this after login or signup + OTP verification
  const login = async () => {
    const { data: { user: currentUser }, error } = await supabase.auth.getUser();
    if (error || !currentUser) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    // Fetch profile info from 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, phone')
      .eq('id', currentUser.id)
      .single();

    setUser(profile || {
      id: currentUser.id,
      name: currentUser.user_metadata?.name || null,
      email: currentUser.email,
      phone: currentUser.phone || null,
    });

    setIsLoggedIn(true);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setAuthModalOpen(false);
  };

  const showAuthModal = () => setAuthModalOpen(true);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        showAuthModal,
        authModalOpen,
        setAuthModalOpen,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
