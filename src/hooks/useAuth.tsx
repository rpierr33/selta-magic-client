import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { localClient } from '@/lib/localClient';

// User type
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin user credentials for special handling
const ADMIN_EMAIL = 'Roosseltam@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user: sessionUser, error } = await localClient.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error);
        } else if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setError(error instanceof Error ? error.message : 'Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    localClient.onAuthStateChange((event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      }
    });
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: userData, error } = await localClient.signInWithPassword(email, password);

      if (error) {
        let userFriendlyError = error;
        // Make error messages more user-friendly
        if (error.toLowerCase().includes('invalid credentials')) {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.toLowerCase().includes('network')) {
          userFriendlyError = 'Network error. Please check your connection and try again.';
        } else if (error.toLowerCase().includes('user not found')) {
          userFriendlyError = 'No account found with this email address.';
        }
        throw new Error(userFriendlyError);
      }

      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: userData, error } = await localClient.signUp(email, password, firstName, lastName);

      if (error) {
        let userFriendlyError = error;
        // Make error messages more user-friendly
        if (error.toLowerCase().includes('already exists') || error.toLowerCase().includes('duplicate')) {
          userFriendlyError = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.toLowerCase().includes('network')) {
          userFriendlyError = 'Network error. Please check your connection and try again.';
        } else if (error.toLowerCase().includes('password')) {
          userFriendlyError = 'Password does not meet requirements. Please choose a stronger password.';
        }
        throw new Error(userFriendlyError);
      }

      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await localClient.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw new Error(error);
      }
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
    }
  };

  const authValue = { 
    user, 
    loading, 
    login, 
    signup,
    logout,
    isAdmin: user?.role === 'admin',
    error,
    clearError
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
