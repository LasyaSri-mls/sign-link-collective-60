import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  phone: string;
  name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  place: string;
  id: string;
  is_active: boolean;
  has_given_consent: boolean;
  consent_given_at: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  contributionsCount?: number;
  badgesEarned?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://api.corpus.swecha.org/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setAccessToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('accessToken');
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        
        setAccessToken(token);
        localStorage.setItem('accessToken', token);
        
        // Fetch user data after successful login
        await fetchCurrentUser(token);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Note: This API doesn't seem to have a registration endpoint
    // You may need to implement this separately or use a different endpoint
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};