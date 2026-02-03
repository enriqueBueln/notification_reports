"use client";

import { useTeachers } from "@/hooks/useTeacher";
import { NotificationFormValues, notificationSchema } from "@/lib/form_schema";
import { useEffect, useState } from "react";

import { useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent } from "./ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeacherSelector } from "./teacher-selector";
import { DateAndFolioFields } from "./date-folio";
import { ShiftSelector } from "./shift-selector";
import { ClassGrid } from "./class-grid";
import { useGroups } from "@/hooks/useGroup";
import { Button } from "./ui/button";
import { buildBlocks } from "@/actions/attendance";

export const NotificationForm = () => {
  //defino lo que va contener el formulario, mediante react-hook-form
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      teacherId: "",
      date: "",
      folio: "",
      absences: [],
    },
  });

  //manejo un array dinamico de ausencias ya que en el formulario se pueden agregar o quitar clases
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "absences",
  });

  //obtengo los datos de los profesores y grupos mediante hooks personalizados
  const teachers = useTeachers();
  //obtengo los datos de los grupos mediante hook personalizado
  const groups = useGroups(); // ← Hook centralizado

  const [activeShifts, setActiveShifts] = useState<string[]>([]);

  const [selectedClasses, setSelectedClasses] = useState<
    Record<string, string | string[]>
  >({});

  useEffect(() => {
    activeShifts.forEach((shiftId) => {
      console.log(shiftId);
      groups.fetchGroupsForShift(shiftId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShifts, groups.fetchGroupsForShift]);

  // Limpiar clases cuando cambian los turnos (por exclusión)
  useEffect(() => {
    const validKeys = new Set<string>();
    activeShifts.forEach((shift) => {
      Object.keys(selectedClasses).forEach((key) => {
        console.log(key);
        if (key.startsWith(`${shift}-`)) {
          validKeys.add(key);
        }
      });
    });

    // Remover clases que ya no son válidas
    Object.keys(selectedClasses).forEach((key) => {
      if (!validKeys.has(key)) {
        const [shiftId, classIdx] = key.split("-");
        const indexToRemove = fields.findIndex(
          (f) => f.shiftId === shiftId && f.classIndex === Number(classIdx),
        );
        if (indexToRemove !== -1) {
          remove(indexToRemove);
        }
      }
    });

    // Actualizar selectedClasses
    setSelectedClasses((prev) => {
      const newSelection: Record<string, string | string[]> = {};
      validKeys.forEach((key) => {
        newSelection[key] = prev[key];
      });
      return newSelection;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShifts]);
  const handleClassToggle = (
    shiftId: "matutino" | "vespertino" | "sabatino",
    classIdx: number,
    modality?: "clase" | "asesoria",
  ) => {
    const key = `${shiftId}-${classIdx}`;

    if (key in selectedClasses) {
      // REMOVER
      const indexToRemove = fields.findIndex(
        (f) => f.shiftId === shiftId && f.classIndex === classIdx,
      );
      if (indexToRemove !== -1) {
        remove(indexToRemove);
      }

      const newSelection = { ...selectedClasses };
      delete newSelection[key];
      setSelectedClasses(newSelection);
    } else {
      // AGREGAR
      append({
        shiftId,
        classIndex: classIdx,
        group: "",
        hours: 1,
        ...(modality && { modality }), // Solo agregar modality si existe
      });

      setSelectedClasses({ ...selectedClasses, [key]: "" });
    }
  };

  // ← NUEVA FUNCIÓN para limpiar clases de un turno
  const handleShiftDeselect = (shiftId: string) => {
    // 1. Encontrar índices a eliminar del formulario
    const indicesToRemove: number[] = [];
    fields.forEach((field, index) => {
      if (field.shiftId === shiftId) {
        indicesToRemove.push(index);
      }
    });

    // 2. Eliminar en orden inverso para no afectar índices
    indicesToRemove.reverse().forEach((index) => {
      remove(index);
    });

    // 3. Limpiar selectedClasses
    setSelectedClasses((prev) => {
      const newSelection = { ...prev };
      Object.keys(newSelection).forEach((key) => {
        if (key.startsWith(`${shiftId}-`)) {
          delete newSelection[key];
        }
      });
      return newSelection;
    });
  };

  async function generarOficio(data: NotificationFormValues) {
    const blocks = buildBlocks(data.absences);
    console.log(blocks);
    const res = await fetch("/api/oficios/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numOficio: data.folio,
        fecha: data.date,
        nombre: data.teacherId,
        blocks: blocks,
      }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "oficio.docx";
    a.click();
  }

  const handleGroupChange = (key: string, groupId: string | string[]) => {
    const [shiftId, classIdx] = key.split("-");
    const index = fields.findIndex(
      (f) => f.shiftId === shiftId && f.classIndex === Number(classIdx),
    );

    if (index !== -1) {
      form.setValue(`absences.${index}.group`, groupId);
    }

    setSelectedClasses((prev) => ({ ...prev, [key]: groupId }));
  };

  return (
    <Card>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (data) => {
            console.log("HOLA");
            await generarOficio(data);
          })}
        >
          <TeacherSelector
            teachers={teachers}
            onSelect={(name) => form.setValue("teacherId", name)}
            error={form.formState.errors.teacherId?.message}
          />

          <DateAndFolioFields control={form.control} />

          <ShiftSelector
            activeShifts={activeShifts}
            toggleShift={setActiveShifts}
            selectedClasses={selectedClasses}
            onShiftDeselect={handleShiftDeselect}
          />

          <ClassGrid
            activeShifts={activeShifts}
            selectedClasses={selectedClasses}
            groupsByShift={groups.groupsByShift}
            groupsLoading={groups.loading}
            searchGroups={groups.searchGroups}
            onClassToggle={handleClassToggle}
            onGroupChange={handleGroupChange}
            errors={{}}
            onShiftDeselect={handleShiftDeselect}
          />

          <Button type="submit">Generar documento</Button>
        </form>
      </CardContent>
    </Card>
  );
};
