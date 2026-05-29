import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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
        token,
        isAuthenticated: !!token,
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
