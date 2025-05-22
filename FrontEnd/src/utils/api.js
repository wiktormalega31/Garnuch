import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Proxy przekieruje na http://localhost:8000
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
