import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* Listen to Firebase auth state changes — persists across refreshes */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Save / update user record in Firestore on login */
  const saveUserToFirestore = async (firebaseUser) => {
    try {
      const ref = doc(db, 'users', firebaseUser.uid);
      await setDoc(ref, {
        uid:         firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email:       firebaseUser.email,
        photoURL:    firebaseUser.photoURL,
        lastLoginAt: serverTimestamp(),
        createdAt:   serverTimestamp(),   // merge:true means this only writes on first login
      }, { merge: true });
    } catch (err) {
      console.error('Failed to save user to Firestore:', err);
    }
  };

  /* Google sign-in via popup */
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    return result.user;
  };

  /* Sign out and redirect to landing */
  const signOut = async () => {
    await firebaseSignOut(auth);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* Custom hook for easy consumption */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
