
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function SomeComponent() {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      Welcome, {user.name}!
      {/* ...existing code... */}
    </div>
  );
}

export default SomeComponent;