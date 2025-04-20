
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  useEffect(() => {
    navigate('/login', { state: { mode: 'signup' } });
  }, [navigate]);

  return <div>Redirecting to signup...</div>;
};

export default Signup;
