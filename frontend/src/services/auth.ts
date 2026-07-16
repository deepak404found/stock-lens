import { api, type ApiSuccess } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiSuccess<{ user: AuthUser }>>("/api/v1/auth/login", {
    email,
    password,
  });
  return data.data.user;
}

export async function logout() {
  await api.post<ApiSuccess<null>>("/api/v1/auth/logout");
}

export async function getMe() {
  const { data } = await api.get<ApiSuccess<{ user: AuthUser }>>("/api/v1/auth/me");
  return data.data.user;
}
