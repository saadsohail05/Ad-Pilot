import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Run on mount and when token changes
  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);