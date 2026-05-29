import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData } = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Login credentials incorrect');
    }
  };

  const register = async (name, email, password, phone, dob, profession) => {
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        dob,
        profession,
      });
    } catch (error) {
      throw new Error(error.message || 'Registration details failed validations');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const resetWallet = async () => {
    try {
      const response = await api.post('/wallet/reset');
      const updatedUser = { ...user, wallet_balance: response.data.new_balance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return response.data.new_balance;
    } catch (error) {
      throw new Error(error.message || 'Resetting simulated funds failed');
    }
  };

  const updateWalletBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, wallet_balance: parseFloat(newBalance) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // Backward compatibility fallback
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        resetWallet,
        updateWalletBalance,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
