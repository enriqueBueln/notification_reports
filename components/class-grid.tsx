import { Group } from "@/models";
import { ClassCard } from "./class-card";

interface ClassGridProps {
  activeShifts: string[];
  selectedClasses: Record<string, string | string[]>;
  groupsByShift: Record<string, Group[]>; // ← NUEVA
  groupsLoading: Record<string, boolean>; // ← NUEVA
  searchGroups: (query: string, shiftId: string) => Promise<Group[]>; // ← NUEVA
  onClassToggle: (
    shiftId: "matutino" | "vespertino" | "sabatino",
    classIdx: number,
    modality?: "clase" | "asesoria"
  ) => void;
  onGroupChange: (key: string, groupId: string | string[]) => void;
  errors?: Record<string, string>;
  
  onShiftDeselect: (shiftId: string) => void; // ← NUEVA
}

export const ClassGrid = ({
  activeShifts,
  selectedClasses,
  groupsByShift,
  groupsLoading,
  searchGroups,
  onClassToggle,
  onGroupChange,
  errors,
  onShiftDeselect
}: ClassGridProps) => {
  const SHIFTS: Record<"matutino" | "vespertino" | "sabatino", { label: string; clases: number }> = {
    matutino: { label: "Matutino", clases: 6 },
    vespertino: { label: "Vespertino", clases: 6 },
    sabatino: { label: "Sabatino", clases: 8 },
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeShifts.map((shiftId) => {
        const typedShiftId = shiftId as "matutino" | "vespertino" | "sabatino";
        return (
        <ClassCard
          key={shiftId}
          shiftId={typedShiftId}
          shiftLabel={SHIFTS[typedShiftId].label}
          totalClasses={SHIFTS[typedShiftId].clases}
          selectedClasses={selectedClasses}
          groups={groupsByShift[shiftId] || []} // ← Pasa los grupos del turno
          isLoadingGroups={groupsLoading[shiftId] || false} // ← Pasa el loading
          searchGroups={searchGroups} // ← Pasa la función
          onClassToggle={onClassToggle}
          onGroupChange={onGroupChange}
          errors={errors}
          onShiftDeselect={onShiftDeselect}
        />
      )})}
    </div>
  );
};
