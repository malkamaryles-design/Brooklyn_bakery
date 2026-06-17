import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/authService';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const login = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData ?? null);
    setLoginModalOpen(false);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPendingCheckout(false);
  }, []);
  const openLoginModal = useCallback((forCheckout = false) => {
    setPendingCheckout(forCheckout);
    setLoginModalOpen(true);
  }, []);
  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setPendingCheckout(false);
  }, []);
  const clearPendingCheckout = useCallback(() => setPendingCheckout(false), []);
  return (
    <AuthContext.Provider value={{
      token, user, loading, isLoggedIn: !!token,
      login, logout,
      isLoginModalOpen, openLoginModal, closeLoginModal,
      pendingCheckout, clearPendingCheckout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);