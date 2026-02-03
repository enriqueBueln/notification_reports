import { Teacher } from "@/models";
import { useState } from "react";

export function useTeachers() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const fetchInitial = async () => {
    const response = await fetch("/api/teachers?limit=10");
    return response.json();
  };

  const search = async (query: string) => {
    const response = await fetch(`/api/teachers?search=${query}`);
    return response.json();
  };

  return {
    selectedTeacher,
    setSelectedTeacher,
    fetchInitial,
    search,
  };
}
