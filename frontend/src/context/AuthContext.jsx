import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('peblo_token');
    const cached = localStorage.getItem('peblo_user');
    if (token && cached) {
      try { setUser(JSON.parse(cached)); } catch {}
      // Verify token is still valid
      authAPI.me()
        .then(res => { setUser(res.data.user); localStorage.setItem('peblo_user', JSON.stringify(res.data.user)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('peblo_token', token);
    localStorage.setItem('peblo_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await authAPI.signup({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('peblo_token', token);
    localStorage.setItem('peblo_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('peblo_token');
    localStorage.removeItem('peblo_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
