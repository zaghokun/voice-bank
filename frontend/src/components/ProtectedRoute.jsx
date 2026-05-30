import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return null;
  if (!token) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
