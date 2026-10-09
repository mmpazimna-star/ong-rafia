import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("adminUser") || "null"));

  const login = (jwt, currentUser) => {
    setToken(jwt);
    setUser(currentUser);
    localStorage.setItem("adminToken", jwt);
    localStorage.setItem("adminUser", JSON.stringify(currentUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  useEffect(() => {
    const handleExpiredSession = () => logout();
    window.addEventListener("admin-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("admin-auth-expired", handleExpiredSession);
  }, []);

  const updateCurrentUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("adminUser", JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateCurrentUser,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
