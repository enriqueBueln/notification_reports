import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { Block } from "@/actions/attendance";

const meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export async function POST(req: Request) {
  const data = await req.json();

  // 1️⃣ Leer la plantilla
  const templatePath = path.join(process.cwd(), "templates", "oficio.docx");

  const content = fs.readFileSync(templatePath, "binary");

  // 2️⃣ Cargar el docx
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Crear fecha en hora local sin conversión UTC
  const [year, month, day] = data.fecha.split("-").map(Number);
  const fechaFormateada = new Date().toLocaleDateString(
    "es-ES",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  const horasTotales = data.blocks.reduce((acc: number, block: Block) => {
    const totalBlockHours = block.filas.reduce(
      (sum: number, fila: { totalHoras: number }) => sum + fila.totalHoras,
      0,
    );
    return acc + totalBlockHours;
  }, 0);

  // 3️⃣ Reemplazar variables
  console.log(data.blocks.some((b: Block) => b.sabatina));
  doc.render({
    oficio: data.numOficio,
    dia: day,
    mes: meses[month - 1],
    anio: year,
    fecha: fechaFormateada,
    nombre: data.nombre,
    blocks: data.blocks,
    total_horas: horasTotales,
    sabatina: data.blocks.some((b: Block) => b.sabatina),
  });

  // 4️⃣ Generar el archivo
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  // 5️⃣ Responder el archivo
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=oficio.docx",
    },
  });
}
