import { z } from "zod";

// 1. Definimos qué es una "Falta" individual
const absenceEntrySchema = z.object({
  shiftId: z.enum(["matutino", "vespertino", "sabatino"]),
  classIndex: z.number(),
  modality: z.enum(["clase", "asesoria"]).optional(), // Solo para sabatino
  // Ahora puede ser un string O un array de strings
  group: z.union([
    z.string().min(1, "El grupo es obligatorio"),
    z.array(z.string()).min(1, "Selecciona al menos un grupo")
  ]),
  hours: z.number().min(1, "Mínimo 1 hora").max(8, "Máximo 8 horas"),
});

// 2. Definimos el formulario completo
export const notificationSchema = z.object({
  teacherId: z.string().min(1, "Selecciona un maestro"),
  date: z.string().min(1, "La fecha es obligatoria"),
  folio: z.string().min(1, "El folio es obligatorio"),
  absences: z.array(absenceEntrySchema).min(1, "Debes marcar al menos una clase"),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;