import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import API from "../axiosConfig";

/* ──────────────────────────────────────────────────────────────
 * 1.  Kontekst
 * ──────────────────────────────────────────────────────────── */
export const AuthContext = createContext(null);

/* ──────────────────────────────────────────────────────────────
 * 2.  Provider
 * ──────────────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
  /* --- stan --- */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* --- pomocnicza funkcja: pobierz profil, jeśli sesja istnieje --- */
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/user/");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* --- przy starcie aplikacji: sprawdź sesję --- */
  useEffect(() => {
    fetchUser();
  }, []);

  /* --- akcje --- */
  const login = async (username, password) => {
    await API.post("/auth/login/", { username, password });
    await fetchUser(); // cookie sesyjne już ustawione
  };

  const register = async (username, email, password) => {
    await API.post("/auth/registration/", {
      username,
      email,
      password1: password,
      password2: password,
    });
    await fetchUser();
  };

  const logout = async () => {
    await API.post("/auth/logout/");
    setUser(null); // sesja usunięta przez backend
  };

  /* --- render --- */
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* --- PropTypes --- */
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ──────────────────────────────────────────────────────────────
 * 3.  Wygodny hook
 * ──────────────────────────────────────────────────────────── */
export const useAuth = () => useContext(AuthContext);
