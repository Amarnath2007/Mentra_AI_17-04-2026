import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('mentra_user');
    const token = localStorage.getItem('mentra_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch(e) {}
    }
    setLoading(false);
  }, []);

  const handleAuth = (token, userData) => {
    localStorage.setItem('mentra_token', token);
    localStorage.setItem('mentra_user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async ({ name, email, password, role }) => {
    const res = await api.signup({ name, email, password, role });
    handleAuth(res.data.token, res.data.user);
    router.push('/dashboard');
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await api.login({ email, password });
    handleAuth(res.data.token, res.data.user);
    router.push('/dashboard');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mentra_token');
    localStorage.removeItem('mentra_user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('mentra_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
