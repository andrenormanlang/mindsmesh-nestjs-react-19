import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/types";
import { getProfile } from "../services/MindsMeshAPI";

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
      // Fetch the user's profile from the server.
      const userProfile = await getProfile();
      setUser(userProfile);
      console.log("UserProvider: Refreshed user profile", userProfile);
    } catch (error) {
      console.error("UserProvider: Error refreshing user profile", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
