// src/lib/authUtils.ts
import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/types/enums.types";
import { jwtUtils } from "./jwtUtils";

export interface IDecodedToken {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  iat: number;
  exp: number;
}

export const getUserInfo = jwtUtils.decodedToken

export const isLoggedIn = () => {
  return getUserInfo;
};

export const AuthRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const isAuthRoute = (pathname: string) => {
  return AuthRoutes.some((route) => pathname.startsWith(route));
};

export const getRouteOwner = (pathname: string): string | null => {
  if (pathname.startsWith("/super-admin")) return "SUPER_ADMIN";
  if (pathname.startsWith("/admin")) return "ADMIN"; // We will unify OWNER and ADMIN here
  if (pathname.startsWith("/member")) return "MEMBER";
  return null; // Public or common route
};

export const getDefaultDashboardRoute = (role: string | undefined): string => {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if (role === "OWNER" || role === "ADMIN") return "/admin";
  if (role === "MEMBER") return "/member";
  return "/login";
};
