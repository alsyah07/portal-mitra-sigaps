import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userData: User) => {
    login(userData);
    navigate('/', { replace: true });
  };

  return <Login onLogin={handleLogin} />;
}
