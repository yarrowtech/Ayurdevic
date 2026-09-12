import api from "./api";

export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post("/api/user/register", { name, email, password });
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/api/user/login", { email, password });
  return data;
};

export const getGoogleConfig = async () => {
  const { data } = await api.get("/api/user/google/config");
  return data;
};

export const googleSignIn = async (credential) => {
  const { data } = await api.post("/api/user/google", { credential });
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.get("/api/user/logout");
  return data;
};

export const checkAuth = async () => {
  const { data } = await api.get("/api/user/is-auth");
  return data;
};
