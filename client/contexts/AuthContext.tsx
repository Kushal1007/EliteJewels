"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  showAuthModal: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  user: ProfileUser | null;
  setUser: (user: ProfileUser | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount and listen for changes
  useEffect(() => {
    let mounted = true;

    const restore = async () => {
      try {
        // getSession returns session + user
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;

        if (sessionUser) {
          // fetch profile row if exists
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, name, email, phone")
            .eq("id", sessionUser.id)
            .single();

          if (mounted) {
            if (profile && !error) {
              setUser({
                id: profile.id,
                name: profile.name ?? sessionUser.user_metadata?.name ?? null,
                email: profile.email ?? sessionUser.email ?? null,
                phone: profile.phone ?? (sessionUser.phone ?? null),
              });
            } else {
              // fallback to auth user data if no profile row
              setUser({
                id: sessionUser.id,
                name: sessionUser.user_metadata?.name ?? null,
                email: sessionUser.email ?? null,
                phone: sessionUser.phone ?? null,
              });
            }
            setIsLoggedIn(true);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.error("restore session error", err);
        if (mounted) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restore();

    // Listen for auth changes (sign in/out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log("onAuthStateChange", event, session);
      const sessionUser = session?.user ?? null;
      if (!sessionUser) {
        // signed out
        setUser(null);
        setIsLoggedIn(false);
        return;
      }

      // When signed in or session refreshed -> fetch profile
      (async () => {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, name, email, phone")
            .eq("id", sessionUser.id)
            .single();

          if (profile && !error) {
            setUser({
              id: profile.id,
              name: profile.name ?? sessionUser.user_metadata?.name ?? null,
              email: profile.email ?? sessionUser.email ?? null,
              phone: profile.phone ?? (sessionUser.phone ?? null),
            });
          } else {
            setUser({
              id: sessionUser.id,
              name: sessionUser.user_metadata?.name ?? null,
              email: sessionUser.email ?? null,
              phone: sessionUser.phone ?? null,
            });
          }
          setIsLoggedIn(true);
        } catch (err) {
          console.error("onAuthStateChange profile fetch error", err);
          setUser({
            id: sessionUser.id,
            name: sessionUser.user_metadata?.name ?? null,
            email: sessionUser.email ?? null,
            phone: sessionUser.phone ?? null,
          });
          setIsLoggedIn(true);
        }
      })();
    });

    return () => {
      mounted = false;
      // cleanup
      listener.subscription.unsubscribe();
    };
  }, []);

  // Call after login / OTP verification to refresh state
  const login = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, name, email, phone")
        .eq("id", sessionUser.id)
        .single();

      if (profile && !error) {
        setUser({
          id: profile.id,
          name: profile.name ?? sessionUser.user_metadata?.name ?? null,
          email: profile.email ?? sessionUser.email ?? null,
          phone: profile.phone ?? sessionUser.phone ?? null,
        });
      } else {
        setUser({
          id: sessionUser.id,
          name: sessionUser.user_metadata?.name ?? null,
          email: sessionUser.email ?? null,
          phone: sessionUser.phone ?? null,
        });
      }
      setIsLoggedIn(true);
      setAuthModalOpen(false);
    } catch (err) {
      console.error("login refresh error", err);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("logout error", err);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setAuthModalOpen(false);
    }
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
