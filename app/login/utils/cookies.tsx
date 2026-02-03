"use server";

import { cookies } from "next/headers";

export async function create(data: { token: string; role: string }) {
  const cookieStore = await cookies();

  cookieStore.set("token", data.token);
  // or
  cookieStore.set("role", data.role, { secure: true });
}
