import { Group } from "@/models";
import { useCallback, useRef, useState } from "react";

// hooks/useGroups.ts
export function useGroups() {
  const [groupsByShift, setGroupsByShift] = useState<Record<string, Group[]>>(
    {},
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const groupsRef = useRef<Record<string, Group[]>>({});

  const fetchGroupsForShift = useCallback(async (shiftId: string) => {
    // Si ya los tenemos, no volver a hacer fetch

    if (groupsRef.current[shiftId]) return groupsRef.current[shiftId];
    setLoading((prev) => ({ ...prev, [shiftId]: true }));

    try {
      shiftId =
        shiftId === "matutino" ? "7" : shiftId === "vespertino" ? "8" : "9";
      const response = await fetch(`/api/groups?shift=${shiftId}&limit=10`);
      const data = await response.json();
      shiftId =
        shiftId === "7"
          ? "matutino"
          : shiftId === "8"
            ? "vespertino"
            : "sabatino";
      groupsRef.current[shiftId] = data;
      setGroupsByShift((prev) => ({ ...prev, [shiftId]: data }));
      return data;
    } finally {
      setLoading((prev) => ({ ...prev, [shiftId]: false }));
    }
  }, []);

  const searchGroups = useCallback(async (query: string, shiftId: string) => {
    shiftId =
      shiftId === "matutino" ? "7" : shiftId === "vespertino" ? "8" : "9";
    const response = await fetch(
      `/api/groups?shift=${shiftId}&search=${query}`,
    );

    shiftId =
      shiftId === "7"
        ? "matutino"
        : shiftId === "8"
          ? "vespertino"
          : "sabatino";
    return response.json();
  }, []);

  return {
    groupsByShift,
    loading,
    fetchGroupsForShift,
    searchGroups,
  };
}
