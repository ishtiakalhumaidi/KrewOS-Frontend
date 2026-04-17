// src/app/(dashboardLayout)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default async function DashboardRedirectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = jwtDecode(token) as { role: string };
    
    // Perform instant server-side redirects based on role!
    if (decoded.role === "SUPER_ADMIN") redirect("/super-admin");
    if (decoded.role === "ADMIN" || decoded.role === "OWNER") redirect("/admin");
    if (decoded.role === "MEMBER") redirect("/member");

  } catch (error) {
    redirect("/login");
  }

  // Fallback if role is unrecognized
  return null;
}