import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken())); // restoring session

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // restore session from a saved token
  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    const me = await api.get('/auth/me');
    setUser(me.data);
    return me.data;
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
