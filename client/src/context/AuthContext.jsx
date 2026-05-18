import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexasestate_token');
    const savedUser = localStorage.getItem('nexasestate_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const res = await API.post('/auth/login', { email, password, role });
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('nexasestate_token', newToken);
    localStorage.setItem('nexasestate_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const registerLandlord = async (data) => {
    const res = await API.post('/auth/register-landlord', data);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('nexasestate_token', newToken);
    localStorage.setItem('nexasestate_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const registerTenant = async (data) => {
    const res = await API.post('/auth/register-tenant', data);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('nexasestate_token', newToken);
    localStorage.setItem('nexasestate_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('nexasestate_token');
    localStorage.removeItem('nexasestate_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    role: user?.role || null,
    login,
    registerLandlord,
    registerTenant,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
