import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const data = await getMe();
          setUserState(data.user);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUserState(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUserState(data.user);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await logoutRequest(refreshToken);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUserState(null);
  };

  const updateUser = (userData) => setUserState(userData);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
