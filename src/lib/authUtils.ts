// src/lib/authUtils.ts
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "./cookieUtils";

export interface IDecodedToken {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "OWNER" | "ADMIN" | "MEMBER";
  companyId: string | null;
  iat: number;
  exp: number;
}

export const getUserInfo = (): IDecodedToken | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<IDecodedToken>(token);
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

export const isLoggedIn = () => {
  return !!getUserInfo();
};