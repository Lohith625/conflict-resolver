import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { conflictId } = await req.json()
    if (!conflictId) {
      return NextResponse.json({ error: 'conflictId required' }, { status: 400 })
    }

    // Verify ownership
    const conflict = await prisma.conflict.findUnique({ where: { id: conflictId } })
    if (!conflict || conflict.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return existing session if one already exists
    if (conflict.status === 'SHARED' || conflict.status === 'RESOLVED') {
      const existing = await prisma.coSession.findUnique({ where: { conflictId } })
      if (existing) return NextResponse.json({ sessionId: existing.id })
    }

    // Create new co-draft session
    const coSession = await prisma.coSession.create({
      data: { conflictId },
    })

    // Update conflict status
    await prisma.conflict.update({
      where: { id: conflictId },
      data: { status: 'SHARED' },
    })

    return NextResponse.json({ sessionId: coSession.id })
  } catch (err: any) {
    console.error('[/api/sessions]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
