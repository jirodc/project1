import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    await logout();
    toast.success('You have been signed out.');
    navigate('/login', { replace: true });
  };

  return { signOut, isSigningOut };
}
