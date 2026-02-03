import { useTeachers } from "@/hooks/useTeacher";
import { Label } from "./ui/label";
import { Teacher } from "@/models/teacher";
import { SmartComboBox } from "./form/smartcombox";

// components/TeacherSelector.tsx
interface TeacherSelectorProps {
  teachers: ReturnType<typeof useTeachers>;
  onSelect: (name: string) => void;
  error?: string; // Agregar prop de error
}

export const TeacherSelector = ({
  teachers,
  onSelect,
  error,
}: TeacherSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Nombre del maestro</Label>
      <SmartComboBox<Teacher>
        placeholder="Buscar maestro"
        fetchInitial={teachers.fetchInitial}
        searchFn={teachers.search}
        labelField="name"
        valueField="id"
        value={teachers.selectedTeacher}
        onSelect={(teacher) => {
          console.log(teacher)
          if (teacher && !Array.isArray(teacher)) {
            teachers.setSelectedTeacher(teacher);
            onSelect(teacher.name);
          }
        }}
        error={error}
      />
    </div>
  );
};
