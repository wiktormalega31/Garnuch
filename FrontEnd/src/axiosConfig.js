import axios from "axios";

/* ───────── 1. URL backendu ───────── */
export const BACKEND =
  import.meta.env.VITE_BACKEND?.replace(/\/$/, "") || "http://localhost:8000";

/* ───────── 2. instancja Axios ───────── */
const API = axios.create({
  baseURL: BACKEND,
  withCredentials: true, // cookies sess + csrf
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// ─── Debug: log wszystkich requestów ─────────────────────
API.interceptors.request.use((cfg) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  if (csrfToken) {
    cfg.headers["X-CSRFToken"] = csrfToken;
  }
  console.group("[API request]");
  console.log("URL:", cfg.baseURL + cfg.url);
  console.log("Method:", cfg.method);
  console.log("Headers:", cfg.headers);
  console.log("Data:", cfg.data);
  console.groupEnd();
  return cfg;
});

// ─── Debug: log wszystkich response ────────────────────
API.interceptors.response.use(
  (res) => {
    console.group("[API response]");
    console.log("URL:", res.config.url);
    console.log("Status:", res.status);
    console.log("Headers:", res.headers);
    console.log("Data:", res.data);
    console.groupEnd();
    return res;
  },
  (err) => {
    console.group("[API error]");
    if (err.config) console.log("URL:", err.config.url);
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Headers:", err.response.headers);
      console.log("Data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
    console.groupEnd();
    return Promise.reject(err);
  }
);

/* ───────── helper: ensure CSRF cookie ───────── */
let csrfReady = false;
export async function ensureCsrfCookie() {
  if (!csrfReady) {
    await API.get("/api/csrf/"); // backend → 200 + cookie
    csrfReady = true;
  }
}

export default API;
