import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/groups/many - Crear múltiples grupos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Se espera un array de grupos' },
        { status: 400 }
      );
    }

    await prisma.groups.createMany({
      data: body.map((group) => ({
        name: group.name,
        shift_id: group.shift_id,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });

    // Obtener los grupos recién creados
    const createdGroups = await prisma.groups.findMany({
      where: {
        name: {
          in: body.map((g) => g.name),
        },
      },
      include: {
        shifts: true,
      },
    });

    return NextResponse.json(createdGroups, { status: 201 });
  } catch (error) {
    console.error('Error creating groups:', error);
    return NextResponse.json(
      { error: 'Error al crear grupos' },
      { status: 500 }
    );
  }
}