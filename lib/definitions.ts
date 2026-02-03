import * as z from "zod";

export const LoginFormSchema = z.object({
  num_cuenta: z
    .string()
    .min(1, {
      error: "Ingresa un número de cuenta valido, no olvides el guión.",
    })
    .max(9, { error: "Número de cuenta no puede exceder 9 caracteres." })
    .trim(),
  nip: z
    .string()
    .min(6, { error: "El NIP debe tener al menos 5 caracteres." })
    .max(6, { error: "El NIP no puede exceder 5 caracteres." })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        num_cuenta?: string[];
        nip?: string[];
      };
      message?: string;
    }
  | undefined;

export interface SessionPayload {
  id_usuario: number;
  num_cuenta: string;
  expiresAt: Date;
}
