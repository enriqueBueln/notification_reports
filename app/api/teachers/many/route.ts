import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/teachers/many - Crear múltiples profesores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Se espera un array de profesores' },
        { status: 400 }
      );
    }

    await prisma.teachers.createMany({
      data: body.map((teacher) => ({
        name: teacher.name,
        employee_key: teacher.employee_key,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      skipDuplicates: true, // Salta duplicados de employeeKey
    });

    // Obtener los profesores recién creados
    const createdTeachers = await prisma.teachers.findMany({
      where: {
        employee_key: {
          in: body.map((t) => t.employee_key),
        },
      },
    });

    return NextResponse.json(createdTeachers, { status: 201 });
  } catch (error) {
    console.error('Error creating teachers:', error);
    return NextResponse.json(
      { error: 'Error al crear profesores' },
      { status: 500 }
    );
  }
}