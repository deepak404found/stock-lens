import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};
