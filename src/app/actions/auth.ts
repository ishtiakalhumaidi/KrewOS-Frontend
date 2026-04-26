"use server";

import { cookies } from "next/headers";

export async function setAuthCookies(data: { 
  token: string; 
  accessToken: string; 
  refreshToken: string; 
}) {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  // 1. Set the Better Auth Session Token
  cookieStore.set("better-auth.session_token", data.token, cookieOptions);

  // 2. Set the custom Access Token
  cookieStore.set("accessToken", data.accessToken, cookieOptions);

  // 3. Set the custom Refresh Token
  cookieStore.set("refreshToken", data.refreshToken, cookieOptions);
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}