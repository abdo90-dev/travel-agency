import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app start
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: JSON.parse(user) }
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

const login = async (email: string, password: string): Promise<User> => {
  dispatch({ type: 'LOGIN_START' });
  
  try {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const response = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data.user, token: data.token }
    });

    return data.user; // 👈 return the user so TS sees a User
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE' });
    throw error;
  }
};

const register = async (userData: RegisterData): Promise<User> => {
  dispatch({ type: 'LOGIN_START' });
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data.user, token: data.token }
    });

    return data.user; // 👈 return user here too
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE' });
    throw error;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}