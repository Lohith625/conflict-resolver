import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const conflict = await prisma.conflict.findUnique({
      where: { id: params.id },
      include: { coSession: true },
    })

    if (!conflict) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Only the owner can view their conflict
    if (conflict.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(conflict)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
