type ShiftType = "matutino" | "vespertino" | "sabatino" | "asesoria";
type Horario = Record<number, string>;

const HORARIOS: Record<ShiftType, Horario> = {
  matutino: {
    1: "7:00 - 7:50 am",
    2: "7:50 - 8:40 am",
    3: "8:40 - 9:30 am",
    4: "10:00 - 10:50 am",
    5: "10:50 - 11:40 am",
    6: "11:40 - 12:30 pm",
  },
  vespertino: {
    1: "1:00 - 1:50 pm",
    2: "1:50 - 2:40 pm",
    3: "2:40 - 3:30 pm",
    4: "4:00 - 4:50 pm",
    5: "4:50 - 5:40 pm",
    6: "5:40 - 6:30 pm",
  },
  sabatino: {
    1: "7:00 - 7:50 am",
    2: "7:50 - 8:40 am",
    3: "8:40 - 9:30 am",
    4: "9:30 - 10:20 am",
    5: "10:50 - 11:40 am",
    6: "11:40 - 12:30 pm",
    7: "12:30 - 1:20 pm",
    8: "1:20 - 2:10 pm",
  },
  asesoria: {
    1: "5:00 - 5:40 pm",
    2: "5:40 - 6:20 pm",
    3: "6:20 - 7:00 pm",
    4: "7:00 - 7:40 pm",
  },
} as const;

type Absence = {
  shiftId: "matutino" | "vespertino" | "sabatino";
  classIndex: number;
  group: string | string[];
  modality?: "clase" | "asesoria";
};

type Scenarios = {
  escolarizada: boolean;
  sabatino: boolean;
  sabatinoType: "clases" | "asesorias" | null;
};

function detectScenarios(absences: Absence[]): Scenarios {
  const hasMatutino: boolean = absences.some((a) => a.shiftId === "matutino");
  const hasVespertino: boolean = absences.some(
    (a) => a.shiftId === "vespertino",
  );
  const hasSabatino: boolean = absences.some((a) => a.shiftId === "sabatino");

  let sabatinoType: "clases" | "asesorias" | null = null;

  if (hasSabatino) {
    sabatinoType = absences.some((a) => a.modality === "asesoria")
      ? "asesorias"
      : "clases";
  }

  return {
    escolarizada: hasMatutino || hasVespertino,
    sabatino: hasSabatino,
    sabatinoType,
  };
}

type GroupedClass = {
  grupo: string[] | string;
  horario: string;
  totalHoras: number;
};

type CurrentGroup = {
  grupo: string[] | string;
  startIndex: number;
  lastIndex: number;
  totalHours: number;
};

export function groupContinuousClasses(
  absences: Absence[],
  shiftId: "matutino" | "vespertino" | "sabatino",
): GroupedClass[] {
  const filtered: Absence[] = absences
    .filter((a) => a.shiftId === shiftId)
    .sort((a, b) => a.classIndex - b.classIndex);

  const rows: CurrentGroup[] = [];
  let current: CurrentGroup | null = null;

  for (const a of filtered) {
    if (
      current &&
      JSON.stringify(current.grupo) === JSON.stringify(a.group) &&
      a.classIndex === current.lastIndex + 1
    ) {
      current.lastIndex = a.classIndex;
      current.totalHours += 1;
    } else {
      if (current) rows.push(current);

      current = {
        grupo: a.group,
        startIndex: a.classIndex,
        lastIndex: a.classIndex,
        totalHours: 1,
      };
    }
  }

  if (current) rows.push(current);

  return rows.map((r: CurrentGroup): GroupedClass => {
    const horaInicio = HORARIOS[shiftId][r.startIndex].split(" - ")[0];
    const horaFin = HORARIOS[shiftId][r.lastIndex].split(" - ")[1];

    return {
      grupo: r.grupo,
      horario: `${horaInicio} - ${horaFin}`,
      totalHoras: r.totalHours,
    };
  });
}

type Asesoria = {
  grupo: string;
  totalHoras: number;
};

function processAsesorias(absences: Absence[]): Asesoria[] {
  return absences
    .filter((a) => a.shiftId === "sabatino" && a.modality === "asesoria")
    .map((a): Asesoria => {
      const grupos = Array.isArray(a.group) ? a.group : [a.group];
      return {
        grupo: grupos.join(", "),
        totalHoras: grupos.length * 2,
      };
    });
}

export type Block = {
  texto: string;
  tipoTabla: "clases" | "asesorias";
  filas: GroupedClass[] | Asesoria[];
  mostrarHorario?: boolean;
  sabatina?: boolean;
};

export function buildBlocks(absences: Absence[]): Block[] {
  const scenarios: Scenarios = detectScenarios(absences);
  const blocks: Block[] = [];

  if (scenarios.escolarizada) {
    blocks.push({
      texto: "la inasistencia a clases en la modalidad escolarizada",
      tipoTabla: "clases",
      filas: [
        ...groupContinuousClasses(absences, "matutino"),
        ...groupContinuousClasses(absences, "vespertino"),
      ],
      mostrarHorario: true,
      sabatina: false,
    });
  }

  if (scenarios.sabatino) {
    blocks.length = 0;
    if (scenarios.sabatinoType === "clases") {
      blocks.push({
        texto: "la inasistencia a clases en la modalidad semiescolarizada",
        tipoTabla: "clases",
        filas: groupContinuousClasses(absences, "sabatino"),
        mostrarHorario: true,
        sabatina: true,
      });
    }

    if (scenarios.sabatinoType === "asesorias") {
      blocks.push({
        texto: "la inasistencia a asesorías en la modalidad semiescolarizada",
        tipoTabla: "asesorias",
        filas: processAsesorias(absences),
        mostrarHorario: false,
        sabatina: true,
      });
    }
  }
  return blocks;
}
