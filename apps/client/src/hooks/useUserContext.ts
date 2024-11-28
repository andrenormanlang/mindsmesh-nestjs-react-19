import { useContext } from 'react';
import { UserContext, UserContextProps } from '../contexts/UserContext';

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};