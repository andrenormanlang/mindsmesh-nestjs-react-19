// ProtectedRoute.tsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user || !user.isEmailVerified) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
