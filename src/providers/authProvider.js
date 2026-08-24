import React, { useState, useContext, useEffect, useRef } from 'react';
import firebase from '../firebase';
import { getUserDetails } from '../api';
import { useError } from './errorProvider';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const { createError } = useError();
  const confirmRef = useRef(null);
  const recaptchaRef = useRef(null);

  const fireAuth = firebase.auth();

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const { data } = await getUserDetails(token);
          if (data && data.success) {
            setUser({ ...data.user, token, uid: fbUser.uid });
          } else {
            setUser({ uid: fbUser.uid, token });
          }
        } catch {
          setUser({ uid: fbUser.uid });
        }
      } else {
        setUser({});
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      await fireAuth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      createError(err.message);
      setLoading(false);
    }
  };

  const signup = async ({ email, password, c_password, name, phone }) => {
    if (password !== c_password) return createError('Passwords do not match');
    if (password.length <= 8) return createError('Password is too short. ( >= 8 chars)');
    setLoading(true);
    try {
      const { user: fbUser } = await fireAuth.createUserWithEmailAndPassword(email, password);
      if (name) await fbUser.updateProfile({ displayName: name });
    } catch (err) {
      createError(err.message);
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await fireAuth.signInWithPopup(provider);
    } catch (err) {
      createError(err.message);
      setLoading(false);
    }
  };

  const sendPhoneOTP = async (phoneNumber) => {
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new firebase.auth.RecaptchaVerifier(
          'recaptcha-container',
          { size: 'invisible' }
        );
      }
      confirmRef.current = await fireAuth.signInWithPhoneNumber(
        phoneNumber,
        recaptchaRef.current
      );
      return true;
    } catch (err) {
      createError(err.message);
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      return false;
    }
  };

  const verifyPhoneOTP = async (otp) => {
    try {
      if (!confirmRef.current) throw new Error('No pending phone verification');
      await confirmRef.current.confirm(otp);
    } catch (err) {
      createError(err.message);
    }
  };

  const logout = () => {
    fireAuth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading,
        login, signup, logout,
        loginWithGoogle, sendPhoneOTP, verifyPhoneOTP,
      }}
    >
      <div id="recaptcha-container" />
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
