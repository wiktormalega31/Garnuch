// src/axiosConfig.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/", // Adres Twojego Django backendu
  withCredentials: true, // jeśli używasz sesji/cookies
});

export default API;
