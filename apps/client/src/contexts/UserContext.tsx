import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/types";

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => void;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate loading the user from an API or local storage.
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const refreshUser = () => {
    // Simulate refreshing user data (e.g., refetching from an API).
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
