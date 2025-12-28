import api from "@/lib/api";

export const getAllAdmins = () => api.get("/admin");

export const getAdminById = (id: string) => api.get(`/admin/${id}`);
