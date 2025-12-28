
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { loginUser, registerUser } from "@/api-service/auth.service";
import api from "@/lib/api";
import { decodeJwtPayload } from "@/lib/jwt";

interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role : string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setSession: (token: string, user?: User | null) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Decode role for UI rendering only (backend enforces authorization).
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('securityToken') : null;
  const effectiveToken = token || (storedToken && storedToken.trim() ? storedToken : null);
  const decodedRole = effectiveToken ? (decodeJwtPayload(effectiveToken)?.role as string | undefined) : undefined;

  const getErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxiosMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    if (typeof maybeAxiosMessage === 'string' && maybeAxiosMessage.trim()) return maybeAxiosMessage;
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  };

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);

        // New storage: token only
        const storedToken = localStorage.getItem('securityToken');
        if (storedToken && storedToken.trim()) {
          setToken(storedToken);
          // Hydrate user from backend
          try {
            const me = await api.get('/auth/me');
            const nextUser = me.data?.data?.user as User | undefined;
            if (nextUser) setUser(nextUser);
          } catch {
            // Keep token; user may still be able to navigate until a protected call is made.
          }
          return;
        }

        // Backward compatibility: older storage shapes
        const storedAuth = localStorage.getItem('securityAuth');
        if (storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth) as { token?: string };
            if (typeof parsed?.token === 'string' && parsed.token.trim()) {
              localStorage.setItem('securityToken', parsed.token);
              localStorage.removeItem('securityAuth');
              setToken(parsed.token);
              try {
                const me = await api.get('/auth/me');
                const nextUser = me.data?.data?.user as User | undefined;
                if (nextUser) setUser(nextUser);
              } catch {
                // ignore
              }
            } else {
              localStorage.removeItem('securityAuth');
            }
          } catch {
            localStorage.removeItem('securityAuth');
          }
        }

        // legacy
        localStorage.removeItem('securityUser');
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, []);
  
const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await loginUser({ email, password });
      const nextToken = response.data?.data?.token as string | undefined;
      if (!nextToken) throw new Error('Login response is missing token');

      // Store ONLY the token in localStorage.
      localStorage.setItem('securityToken', nextToken);
      localStorage.removeItem('securityAuth');
      localStorage.removeItem('securityUser');
      setToken(nextToken);

      // Hydrate user (kept in React state, NOT localStorage)
      const me = await api.get('/auth/me');
      const nextUser = me.data?.data?.user as User | undefined;
      if (nextUser) setUser(nextUser);

      toast({
        title: "Login successful!",
        description: `Welcome back${nextUser?.name ? `, ${nextUser.name}` : ''}!`,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Login failed');
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      const response = await registerUser({ name, email, password });
      const nextToken = response.data?.data?.token as string | undefined;
      if (!nextToken) throw new Error('Registration response is missing token');

      localStorage.setItem('securityToken', nextToken);
      localStorage.removeItem('securityAuth');
      localStorage.removeItem('securityUser');
      setToken(nextToken);

      const me = await api.get('/auth/me');
      const nextUser = me.data?.data?.user as User | undefined;
      if (nextUser) setUser(nextUser);
  
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Registration failed');
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('securityToken');
    localStorage.removeItem('securityAuth');
    localStorage.removeItem('securityUser');
    setUser(null);
    setToken(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const setSession = async (nextToken: string, nextUser?: User | null) => {
    localStorage.setItem('securityToken', nextToken);
    localStorage.removeItem('securityAuth');
    localStorage.removeItem('securityUser');
    setToken(nextToken);

    if (nextUser) {
      setUser(nextUser);
      return;
    }

    try {
      const me = await api.get('/auth/me');
      const hydrated = me.data?.data?.user as User | undefined;
      if (hydrated) setUser(hydrated);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setSession,
        // Consider localStorage token to avoid race during OAuth redirects.
        isAuthenticated: !!effectiveToken,
        // UI-only: rely on decoded token or hydrated user
        isAdmin: decodedRole === 'admin' || user?.role === 'admin',
      }}
    >
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
