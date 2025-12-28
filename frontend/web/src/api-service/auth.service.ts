import api from "@/lib/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type ResetPasswordPayload = {
  password: string;
};

export const loginUser = (payload: LoginPayload) => api.post("/auth/login", payload)

export const registerUser = (payload: RegisterPayload) => api.post("/auth/register", payload);

export const forgotPassword = (payload: { email: string }) =>
  api.post("/auth/forgot-password", payload);

export const resetPassword = (token: string, payload: ResetPasswordPayload) =>
  api.post(`/auth/reset-password/${token}`, payload);