import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/teachers - Crear un profesor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const teacher = await prisma.teachers.create({
      data: {
        name: body.name,
        employee_key: body.employee_key,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Error al crear el profesor' },
      { status: 500 }
    );
  }
}

// GET /api/teachers - Obtener últimos 10 profesores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('search');

    // Si hay query de búsqueda
    if (q && q.trim().length > 0) {
      const teachers = await prisma.teachers.findMany({
        where: {
          OR: [
            {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              employee_key: {
                contains: q,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 20,
        orderBy: {
          id: 'desc',
        },
      });
      console.log(teachers);
      return NextResponse.json(teachers);
    }

    // Si no, obtener los últimos 10
    const teachers = await prisma.teachers.findMany({
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesores' },
      { status: 500 }
    );
  }
}