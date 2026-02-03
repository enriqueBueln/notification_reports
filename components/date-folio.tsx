import { Control, Controller } from "react-hook-form";
import { NotificationFormValues } from "@/lib/form_schema";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface DateAndFolioFieldsProps {
  control: Control<NotificationFormValues>;
}

export const DateAndFolioFields = ({ control }: DateAndFolioFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Campo de fecha */}
      <div className="space-y-2">
        <Label>Fecha de inasistencia</Label>
        <Controller
          name="date"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input type="date" {...field} />
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {/* Campo de folio */}
      <div className="space-y-2">
        <Label>Número de folio</Label>
        <Controller
          name="folio"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input
                type="text"
                placeholder="Ingrese el número de folio"
                {...field}
              />
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};