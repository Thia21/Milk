import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase.js";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setSession(user ? { email: user.email, role: "admin", uid: user.uid } : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch {
      return { ok: false, error: "Invalid email or password." };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { session, isLoggedIn: Boolean(session), loading, login, logout };
}
