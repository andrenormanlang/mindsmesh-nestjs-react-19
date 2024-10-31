import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/types";
import { getProfile } from "../services/MindsMeshAPI";
import { AxiosError } from "axios";

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load the user from localStorage on initial mount.
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
  
      // Attempt to fetch the user's profile
      const userProfile = await getProfile();
      setUser(userProfile);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status === 403) {
        console.error("UserProvider: Unauthorized, token might be expired. Redirecting to login.");
        // You can clear token and redirect user to login here
        localStorage.removeItem("token");
        setUser(null);
      } else {
        console.error("UserProvider: Error refreshing user profile", error);
      }
    }
  };
  
  

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
