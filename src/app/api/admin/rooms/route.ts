import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { HousekeepingStatus } from '@/lib/types';

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  const db = getDb();
  const rooms = await db.getRooms();

  return NextResponse.json({ rooms });
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
  }

  try {
    const { roomId, housekeepingStatus, notes } = await req.json();

    if (!roomId || !housekeepingStatus) {
      return NextResponse.json(
        { error: 'Room ID and housekeeping status are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const updated = await db.updateRoomHousekeeping(
      roomId,
      housekeepingStatus as HousekeepingStatus,
      notes
    );

    if (!updated) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update room housekeeping status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
