import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../store/authSlice';

const AuthContext = createContext(null);

/** Bootstraps the persisted session once and exposes convenient role helpers to the tree. */
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, bootstrapped } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);

  const value = useMemo(() => ({
    user, token, bootstrapped,
    isAuthenticated: !!token && !!user,
    isTeacher: user?.role === 'TEACHER',
    isStudent: user?.role === 'STUDENT',
  }), [user, token, bootstrapped]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
