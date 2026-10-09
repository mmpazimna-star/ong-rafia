import api from "./axios";

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listUsers = async (token, params) => (await api.get("/api/users", { ...auth(token), params })).data;
export const createUser = async (token, payload) => (await api.post("/api/users", payload, auth(token))).data;
export const updateUser = async (token, id, payload) => (await api.put(`/api/users/${id}`, payload, auth(token))).data;
export const resetPassword = async (token, id, password) => (await api.patch(`/api/users/${id}/reset-password`, { password }, auth(token))).data;
export const changePassword = async (token, payload) => (await api.patch("/api/users/me/password", payload, auth(token))).data;
