import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// Kaunsa role kis module mein likh sakta hai (backend jaisa hi)
const WRITE = {
  customers: ["SALES"],
  vendors: ["PURCHASE"],
  products: ["PURCHASE", "SALES"],
  orders: ["SALES"],
  boms: ["PURCHASE", "SALES"],
  purchase: ["PURCHASE"],
  invoices: ["ACCOUNTS"],
  payments: ["ACCOUNTS"],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const canWrite = (module) =>
    user?.role === "ADMIN" || (WRITE[module] || []).includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);