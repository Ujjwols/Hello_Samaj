import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  city: string;
  wardNumber: string;
  tole: string;
  gender: string;
  dob: string;
  role: string;
  profilePic: string;
  files: { url: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:5000/api/v1";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/users/current-user`, {
        withCredentials: true,
      });
      if (response.data?.data?.user) {
        login(response.data.data.user);
      }
    } catch (error) {
      // just clear auth, don't redirect
      await logout(false);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async (redirect: boolean = false) => {
  try {
    await axios.post(`${API_URL}/users/logout`, {}, { withCredentials: true });
  } catch (error) {
    // optional: console.log("Logout error", error);
  } finally {
    setIsLoggedIn(false);
    setUser(null);
    if (redirect) navigate('/login');
  }
};
  

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        user, 
        isLoading, 
        login, 
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};