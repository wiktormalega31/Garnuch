import { createContext, useState, useEffect } from "react";
import API from "../axiosConfig";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Token ${token}`;
      API.get("/auth/user/")
        .then((res) => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await API.post("/auth/login/", { username, password });
    const newToken = res.data.key;
    localStorage.setItem("token", newToken);
    API.defaults.headers.common["Authorization"] = `Token ${newToken}`;
    setToken(newToken);
    const userRes = await API.get("/auth/user/");
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    const res = await API.post("/auth/registration/", {
      username,
      email,
      password1: password,
      password2: password,
    });
    const newToken = res.data.key;
    localStorage.setItem("token", newToken);
    API.defaults.headers.common["Authorization"] = `Token ${newToken}`;
    setToken(newToken);
    const userRes = await API.get("/auth/user/");
    setUser(userRes.data);
  };

  const logout = async () => {
    await API.post("/auth/logout/");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import { useContext } from "react";
export const useAuth = () => useContext(AuthContext);
