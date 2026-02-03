import { Dispatch, SetStateAction } from "react";
import { Label } from "./ui/label";

interface ShiftSelectorProps {
  activeShifts: string[];
  toggleShift: Dispatch<SetStateAction<string[]>>;
  selectedClasses?: Record<string, string | string[]>; // ← NUEVA
  onShiftDeselect: (shiftId: string) => void; // ← NUEVA
}

export const ShiftSelector = ({
  activeShifts,
  toggleShift,
  onShiftDeselect,
}: ShiftSelectorProps) => {
  const SHIFTS = {
    matutino: { label: "Matutino", clases: 6 },
    vespertino: { label: "Vespertino", clases: 6 },
    sabatino: { label: "Sabatino", clases: 8 },
  };

  const handleToggle = (id: string) => {
    toggleShift((prev) => {
      // Si ya está activo, quitarlo Y limpiar sus clases
      if (prev.includes(id)) {
        onShiftDeselect(id); // ← Limpia las clases de este turno
        return prev.filter((s) => s !== id);
      }

      // Si se selecciona sabatino, eliminar matutino y vespertino
      if (id === "sabatino") {
        onShiftDeselect("matutino"); // ← Limpia matutino
        onShiftDeselect("vespertino"); // ← Limpia vespertino
        return ["sabatino"];
      }

      // Si se selecciona matutino o vespertino, eliminar sabatino
      if (id === "matutino" || id === "vespertino") {
        onShiftDeselect("sabatino"); // ← Limpia sabatino
        return [...prev.filter((s) => s !== "sabatino"), id];
      }

      return [...prev, id];
    });
  };

  return (
    <div className="space-y-3">
      <Label>Turnos</Label>
      <div className="flex gap-2">
        {Object.entries(SHIFTS).map(([id, info]) => (
          <div
            key={id}
            className={`group relative flex items-center justify-between border-primary/30 gap-3 rounded-md border px-4 py-2.5 cursor-pointer transition-all duration-200 ${
              activeShifts.includes(id)
                ? "border-primary/40 bg-primary/5"
                : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border/50"
            }`}
            onClick={() => handleToggle(id)}
          >
            <span className="text-sm font-medium text-foreground/70">
              {info.label}
            </span>
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeShifts.includes(id)
                  ? "bg-primary scale-100"
                  : "bg-transparent scale-0"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
