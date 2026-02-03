import { Dispatch, SetStateAction } from "react";

interface ModalitySelectorProps {
  selectedModality: "clase" | "asesoria";
  onChange: Dispatch<SetStateAction<"clase" | "asesoria">>;
}

export const ModalitySelector = ({
  selectedModality,
  onChange,
}: ModalitySelectorProps) => {
  const modalities = [
    { id: "clase" as const, label: "Clase", icon: "📚" },
    { id: "asesoria" as const, label: "Asesoría", icon: "👨‍🏫" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">
        Modalidad
      </p>
      <div className="flex gap-2">
        {modalities.map((modality) => (
          <div
            key={modality.id}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-all duration-200 ${
              selectedModality === modality.id
                ? "border-primary/40 bg-primary/5"
                : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border/50"
            }`}
            onClick={() => onChange(modality.id)}
          >
            <span className="text-sm font-medium text-foreground/70">
              {modality.label}
            </span>
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                selectedModality === modality.id
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