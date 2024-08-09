import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend URL
});

export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

// Add more API methods as needed
