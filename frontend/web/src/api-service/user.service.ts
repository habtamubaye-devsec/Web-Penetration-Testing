import api from "@/lib/api";

export type UserStatus = "active" | "blocked";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  status: UserStatus;
  lastLogin?: string;
};

export const getAllUsers = async () => {
  const response = await api.get("/user");
  const rawUsers = (response.data?.users ?? []) as Array<any>;

  const mapped: UserListItem[] = rawUsers
    .filter((u) => String(u?.role || "").toLowerCase() !== "admin")
    .map((u) => {
      const id = String(u?._id ?? u?.id ?? "");
      const role = String(u?.role ?? "client");
      const isActive = Boolean(u?.isActive);
      return {
        id,
        name: String(u?.name ?? ""),
        email: String(u?.email ?? ""),
        role,
        image: typeof u?.image === "string" ? u.image : undefined,
        status: (isActive ? "active" : "blocked") as UserStatus,
        // Backend does not track lastLogin; use updatedAt as a best-effort timestamp.
        lastLogin: typeof u?.updatedAt === "string" ? u.updatedAt : undefined,
      };
    })
    .filter((u) => u.id);

  return { data: mapped };
};

export const getUserById = (id: string) => api.get(`/user/${id}`);

export const updateUser = (id: string, profileData: unknown) => api.patch(`/user/update/${id}`, profileData);

export const updateUserProfile = (id: string, profileData: FormData) => {
  // multipart/form-data: include optional `image` plus text fields.
  return api.patch(`/user/update/${id}`, profileData);
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const changePassword = (payload: ChangePasswordPayload) => {
  return api.post("/user/change-password", payload);
};

export const deleteUser = (id: string) => api.delete(`/user/delete/${id}`);

export const toggleUserStatus = (userId: string, status: string) => {
  // Keep old signature used by the UI.
  return api.post("/user/status", { userId, status });
};
