import { Group } from "@/models";
import { useState } from "react";
import { ModalitySelector } from "./modality-selector";
import { SmartComboBox } from "./form/smartcombox";

interface ClassCardProps {
  shiftId: "matutino" | "vespertino" | "sabatino";
  shiftLabel: string;
  totalClasses: number;
  selectedClasses: Record<string, string | string[]>; // Ahora puede ser string O array
  groups: Group[];
  isLoadingGroups: boolean;
  searchGroups: (query: string, shiftId: string) => Promise<Group[]>;
  onClassToggle: (
    shiftId: "matutino" | "vespertino" | "sabatino",
    classNumber: number,
    modality?: "clase" | "asesoria",
  ) => void;
  onGroupChange: (classKey: string, groupId: string | string[]) => void;
  errors?: Record<string, string>; // Errores de validación por classKey

  onShiftDeselect: (shiftId: string) => void; // ← NUEVA
}

export const ClassCard = ({
  shiftId,
  shiftLabel,
  totalClasses,
  selectedClasses,
  groups,
  isLoadingGroups,
  searchGroups,
  onClassToggle,
  onGroupChange,
  errors,
  onShiftDeselect,
}: ClassCardProps) => {
  // Estado para modalidad (solo para sabatino)
  const [modality, setModality] = useState<"clase" | "asesoria">("clase");
  const isSabatino = shiftId === "sabatino";

  // Ajustar número de clases según modalidad en sabatino
  const actualClasses =
    isSabatino && modality === "asesoria" ? 4 : totalClasses;

  return (
    <div className="border border-border/50 rounded-lg p-5 bg-card/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-4 text-foreground/80 tracking-wide">
        {shiftLabel}
      </h3>

      {/* Selector de modalidad solo para sabatino */}
      {isSabatino && (
        <div className="mb-4">
          <ModalitySelector
            selectedModality={modality}
            onChange={() => {
              onShiftDeselect(shiftId); // ← Limpia las clases al cambiar modalidad
              setModality((prev) => (prev === "clase" ? "asesoria" : "clase"));
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: actualClasses }).map((_, i) => {
          const classKey = `${shiftId}-${i + 1}`;
          const isSelected = classKey in selectedClasses;
          const selectedValue = selectedClasses[classKey];

          // Determinar si es array o string
          const isMultiSelect = Array.isArray(selectedValue);
          const selectedGroupNames = isMultiSelect
            ? selectedValue
            : [selectedValue];
          const selectedGroups = groups.filter((g) =>
            selectedGroupNames.includes(g.name),
          );

          return (
            <div
              key={classKey}
              className={`group rounded-md border transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border/50"
              }`}
              onClick={() =>
                onClassToggle(shiftId, i + 1, isSabatino ? modality : undefined)
              }
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-medium text-foreground/70">
                  {i + 1}ª clase
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isSelected
                      ? "bg-primary scale-100"
                      : "bg-transparent scale-0"
                  }`}
                />
              </div>

              {isSelected && (
                <div
                  className="px-4 pb-3 pt-1 border-t border-border/30 animate-in fade-in duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mb-2 tracking-wider">
                    {modality === "asesoria" ? "Grupos (múltiple)" : "Grupo"}
                  </p>

                  {isLoadingGroups ? (
                    <div className="text-xs text-muted-foreground py-2">
                      Cargando...
                    </div>
                  ) : modality === "asesoria" && isSabatino ? (
                    // ASESORÍA: Selección múltiple
                    <SmartComboBox<Group>
                      placeholder="Buscar grupos"
                      searchPlaceholder="Buscar grupos..."
                      fetchInitial={async () => groups}
                      searchFn={(query) => searchGroups(query, shiftId)}
                      labelField="name"
                      valueField="id"
                      value={selectedGroups}
                      onSelect={(selected) => {
                        // selected será un array de grupos
                        console.log(selected);
                        if (Array.isArray(selected)) {
                          const names = selected.map((g: Group) => g.name);
                          onGroupChange(classKey, names);
                        }
                      }}
                      multiple={true}
                      error={errors?.[classKey]}
                    />
                  ) : (
                    // CLASE: Selección única
                    <SmartComboBox<Group>
                      placeholder="Buscar grupo"
                      searchPlaceholder="Buscar grupo..."
                      fetchInitial={async () => groups}
                      searchFn={(query) => searchGroups(query, shiftId)}
                      labelField="name"
                      valueField="id"
                      value={selectedGroups[0] || null}
                      onSelect={(group) => {
                        console.log("UPPPPPP",group);
                        if (group && !Array.isArray(group)) {
                          console.log("Selected group:", group);
                          console.log(classKey);
                          onGroupChange(classKey, group.name);
                        }
                      }}
                      error={errors?.[classKey]}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
