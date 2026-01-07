// DAL: Auth (Server-Side)
import "server-only";
import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("auth_token")?.value;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  // In a real app, verify the token or decode it
  return { token };
}
