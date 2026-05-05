import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = (userData: User, token: string) => {
    login(userData, token);
    navigate('/', { replace: true });
  };

  return <Login onLogin={handleLogin} />;
}
