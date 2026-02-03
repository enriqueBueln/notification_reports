import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/groups - Crear un grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const group = await prisma.groups.create({
      data: {
        name: body.name,
        shift_id: body.shiftId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        shifts: true,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Error al crear el grupo' },
      { status: 500 }
    );
  }
}

// GET /api/groups - Obtener últimos 10 grupos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('search');
    const shiftId = searchParams.get('shift');

    // Búsqueda por nombre
    if (q && q.trim().length > 0){
      const groups = await prisma.groups.findMany({
        where: {
          name: {
            contains: q,
            mode: 'insensitive',
          },
          ...(shiftId ? { shift_id: parseInt(shiftId) } : {}),
        },
        include: {
          shifts: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
      return NextResponse.json(groups);
    }

    // Filtrar por shift_id o traer todos
    const where = shiftId ? { shift_id: parseInt(shiftId) } : {};

    const groups = await prisma.groups.findMany({
      where,
      include: {
        shifts: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Error al obtener grupos' },
      { status: 500 }
    );
  }
}