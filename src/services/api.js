import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 8000
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("quincaillerie:token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const loginRequest = (credentials) =>
    api.post("/auth/login", credentials).then((res) => res.data);

export const registerRequest = (payload) =>
    api.post("/auth/register", payload).then((res) => res.data);

export default api;
