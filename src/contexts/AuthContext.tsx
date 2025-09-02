import React, { createContext, useContext, useState, useEffect } from "react";

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

export interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  loginWithOtp: {
    send: (phone: string) => Promise<boolean>;
    verify: (phone: string, otp: string) => Promise<boolean>;
    resend: (phone: string) => Promise<boolean>;
  };
  signupWithOtp: {
    send: (username: string, email: string, password: string, phone: string) => Promise<boolean>;
    verify: (phone: string, otp: string) => Promise<boolean>;
    resend: (phone: string) => Promise<boolean>;
  };
  logout: () => void;
  isLoading: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "https://api.corpus.swecha.org/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("accessToken");
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Password Login ----------------
  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
        await fetchCurrentUser(token);
        return true;
      } else return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Password Register ----------------
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      return response.ok;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- OTP LOGIN ----------------
  const loginWithOtp = {
    send: async (phone: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        return res.ok;
      } catch (error) {
        console.error("Send login OTP error:", error);
        return false;
      }
    },
    verify: async (phone: string, otp: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });

        if (res.ok) {
          const data = await res.json();
          const token = data.access_token;
          setAccessToken(token);
          localStorage.setItem("accessToken", token);
          await fetchCurrentUser(token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Verify login OTP error:", error);
        return false;
      }
    },
    resend: async (phone: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        return res.ok;
      } catch (error) {
        console.error("Resend login OTP error:", error);
        return false;
      }
    },
  };

  // ---------------- OTP SIGNUP ----------------
  const signupWithOtp = {
    send: async (username: string, email: string, password: string, phone: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, phone }),
        });
        return res.ok;
      } catch (error) {
        console.error("Send signup OTP error:", error);
        return false;
      }
    },
    verify: async (phone: string, otp: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });

        if (res.ok) {
          const data = await res.json();
          const token = data.access_token;
          setAccessToken(token);
          localStorage.setItem("accessToken", token);
          await fetchCurrentUser(token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Verify signup OTP error:", error);
        return false;
      }
    },
    resend: async (phone: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        return res.ok;
      } catch (error) {
        console.error("Resend signup OTP error:", error);
        return false;
      }
    },
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithOtp, signupWithOtp, logout, isLoading, accessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
