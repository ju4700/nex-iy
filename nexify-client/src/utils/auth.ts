import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  token: string | null;
  selectedTeam: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  setSelectedTeam: (teamId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [selectedTeam, setSelectedTeam] = useState<string | null>(localStorage.getItem('selectedTeam'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedTeam = localStorage.getItem('selectedTeam');
    if (storedToken) {
      axios.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setToken(storedToken);
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      }).then((response) => {
        setUser(response.data.user);
      }).catch(() => {
        logout();
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    if (storedTeam) {
      setSelectedTeam(storedTeam);
    }
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedTeam');
    axios.defaults.headers.Authorization = undefined;
    setToken(null);
    setUser(null);
    setSelectedTeam(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, selectedTeam, login, logout, setSelectedTeam, loading }}>
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