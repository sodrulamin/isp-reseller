import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('isp_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('isp_active_workspace_id') || '';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setActiveWorkspaceId('');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/auth/login', { username, password });
      localStorage.setItem('isp_auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('isp_refresh_token', data.refreshToken);
      }
      localStorage.setItem('isp_auth_user', JSON.stringify(data));
      setUser(data);
      if (data.resellerId) {
        localStorage.setItem('isp_active_workspace_id', String(data.resellerId));
        setActiveWorkspaceId(String(data.resellerId));
      } else {
        localStorage.removeItem('isp_active_workspace_id');
        setActiveWorkspaceId('');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isp_auth_token');
    localStorage.removeItem('isp_refresh_token');
    localStorage.removeItem('isp_auth_user');
    localStorage.removeItem('isp_active_workspace_id');
    setUser(null);
    setActiveWorkspaceId('');
  };

  const switchWorkspace = (resellerId) => {
    if (resellerId) {
      localStorage.setItem('isp_active_workspace_id', String(resellerId));
      setActiveWorkspaceId(String(resellerId));
    } else {
      localStorage.removeItem('isp_active_workspace_id');
      setActiveWorkspaceId('');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isSuperAdmin: user?.role === 'ROLE_SUPER_ADMIN',
      isResellerAdmin: user?.role === 'ROLE_RESELLER_ADMIN',
      activeWorkspaceId,
      switchWorkspace,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
