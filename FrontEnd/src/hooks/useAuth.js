import { useEffect, useState } from "react";
import API from "../axiosConfig";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/auth/user/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => setUser(res.data))
      .catch((error) => {
        console.error("Error fetching user:", error);
        setUser(null);
      });
  }, []);

  return { user, isPremium: user?.is_premium };
};
