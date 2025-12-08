import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../api/client.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => localStorage.getItem("accessToken") || ""
  );
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [userName, setUserName] = useState(
    () => localStorage.getItem("userName") || ""
  );

  useEffect(() => {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
  }, [role]);

  useEffect(() => {
    if (userName) localStorage.setItem("userName", userName);
  }, [userName]);

  const login = (jwtToken, roleFromToken, displayName) => {
    setToken(jwtToken);
    setAuthToken(jwtToken);
    setRole(roleFromToken);
    setUserName(displayName);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", null, { withCredentials: true });
    } catch (e) {
      console.error(e);
    }

    localStorage.clear();
    setAuthToken(null);
    setToken("");
    setRole("");
    setUserName("");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
