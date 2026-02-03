"use server";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload } from "@/lib/definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = "",
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    if (!payload) return null;

    const { id_usuario, num_cuenta,  expiresAt } = payload as Record<
      string,
      unknown
    >;

    if (
      typeof id_usuario !== "number" ||
      typeof num_cuenta !== "string" 
    ) {
      return null;
    }

    const date =
      typeof expiresAt === "string" || typeof expiresAt === "number"
        ? new Date(expiresAt)
        : null;

    if (!date || isNaN(date.getTime())) {
      return null;
    }

    return {
      id_usuario,
      num_cuenta,
      expiresAt: date,
    } as SessionPayload;
  } catch (error) {
    console.log("Failed to verify session");
    return null;
  }
}

export async function createSession(id_usuario: number, num_cuenta: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ id_usuario, num_cuenta, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<{
  id_usuario: number;
  num_cuenta: string;
  expiresAt: Date;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) return null;

  // Desciframos la cookie (necesitas implementar `decrypt`)
  return await decrypt(sessionCookie.value);
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
