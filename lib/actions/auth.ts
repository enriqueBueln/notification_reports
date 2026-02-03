"use server";
import { prisma } from "@/lib/prisma";
import { FormState, LoginFormSchema } from "@/lib/definitions";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(state: FormState, formData: FormData) {
  console.log("Login action called");
  // Validate form fields
  console.log("Validating form data:", {
    num_cuenta: formData.get("num_cuenta"),
    nip: formData.get("nip"),
  });
  const validatedFields = LoginFormSchema.safeParse({
    num_cuenta: formData.get("num_cuenta"),
    nip: formData.get("nip"),
  });
  console.log("Validation result:", validatedFields);

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos por llenar o son inválidos", // Agregamos un mensaje fallback
    };
  }
  // Call the provider or db to create a user...
  const data = await prisma.usuario.findFirst({
    where: {
      num_cuenta: validatedFields.data.num_cuenta,
      nip: validatedFields.data.nip,
    },
  });

  const user = data;

  if (!user) {
    // Aquí es donde fallaba antes:
    return {
      message: "Número de cuenta o NIP incorrectos.",
      errors: undefined, // Explícitamente no hay errores de campo
    };
  }

  await createSession(user.id_usuario, user.num_cuenta);

  redirect("/notificacion");

  return;
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUserId(): Promise<number | null> {
  const session = await getSession();
  return session ? session.id_usuario : null;
}
