import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  token: string | null;
  refreshToken: string | null; // Add refresh token
  selectedTeam: string | null;
  login: (token: string, refreshToken: string, user: any) => void; // Update login signature
  logout: () => void;
  setSelectedTeam: (teamId: string) => void;
  loading: boolean;
  refreshAccessToken: () => Promise<void>; // Add refresh token function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [selectedTeam, setSelectedTeam] = useState<string | null>(localStorage.getItem('selectedTeam'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedTeam = localStorage.getItem('selectedTeam');
    if (storedToken) {
      axios.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      }).then((response) => {
        setUser(response.data.user);
      }).catch(async (error) => {
        if (error.response?.status === 401) {
          await refreshAccessToken();
        } else {
          logout();
        }
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    if (storedTeam) {
      setSelectedTeam(storedTeam);
    }
  }, []);

  const login = (newToken: string, newRefreshToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    axios.defaults.headers.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('selectedTeam');
    delete axios.defaults.headers.Authorization;
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setSelectedTeam(null);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/refresh-token', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      axios.defaults.headers.Authorization = `Bearer ${newToken}`;
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(userResponse.data.user);
    } catch (error) {
      logout();
      throw new Error('Failed to refresh token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, selectedTeam, login, logout, setSelectedTeam, loading, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};