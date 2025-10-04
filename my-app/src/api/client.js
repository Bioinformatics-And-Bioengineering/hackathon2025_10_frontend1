// my-app/src/api/client.js
import axios from "axios";

const base =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
});
