
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page with signup mode
    navigate('/login', { state: { mode: 'signup' } });
  }, [navigate]);

  return <div>Redirecting to signup...</div>;
};

export default Signup;
