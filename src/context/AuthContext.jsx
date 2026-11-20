import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hotel_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('hotel_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Synchronize state with localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('hotel_user', JSON.stringify(user));
      localStorage.setItem('hotel_token', token);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('hotel_user');
      localStorage.removeItem('hotel_token');
      localStorage.removeItem('isLoggedIn');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Fallback for offline/demo if backend is unreachable
        return { 
          success: false, 
          message: data.message || 'Invalid email or password' 
        };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch (error) {
      console.warn("Backend auth failed or offline, checking local demo fallback:", error.message);
      
      // Fallback in case backend server is temporarily paused
      const normEmail = email.trim().toLowerCase();
      if ((normEmail === 'administrator@greenvalley.com' || normEmail === 'admin@greenvalley.com') && password === 'admin123') {
        const isAdministrator = normEmail.includes('administrator');
        const fallbackUser = {
          name: isAdministrator ? "Main Administrator" : "Operations Admin",
          email: normEmail,
          role: isAdministrator ? "Administrator" : "Admin",
          avatar: isAdministrator 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
          phone: "+91 98765 43210"
        };
        const demoToken = 'demo-jwt-token-' + Date.now();
        setUser(fallbackUser);
        setToken(demoToken);
        return { success: true, user: fallbackUser };
      }

      return { 
        success: false, 
        message: 'Could not connect to authentication server. Please check backend.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('isLoggedIn');
  };

  const switchRole = async (targetRole) => {
    const isAdministrator = targetRole === 'Administrator';
    const email = isAdministrator ? 'administrator@greenvalley.com' : 'admin@greenvalley.com';
    return await login(email, 'admin123');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('hotel_user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdministrator: user?.role === 'Administrator',
    isAdmin: user?.role === 'Admin',
    loading,
    login,
    logout,
    switchRole,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
