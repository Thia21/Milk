import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

const ADMIN_EMAIL    = "admin@sekarmilk.in";
const ADMIN_PASSWORD = "admin";
const AUTH_KEY       = "sekar-auth-session";

export function useAuth() {
  const [session, setSession] = useLocalStorage(AUTH_KEY, null);

  const login = useCallback((email, password) => {
    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      setSession({ email: ADMIN_EMAIL, role: "admin", loginAt: new Date().toISOString() });
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password." };
  }, [setSession]);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  return {
    session,
    isLoggedIn: Boolean(session),
    loading: false,
    login,
    logout,
  };
}
