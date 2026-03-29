import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.coSession.findUnique({
      where: { id: params.id },
      include: {
        conflict: {
          select: {
            id: true,
            title: true,
            description: true,
            analysis: true,
            status: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.resolvedAt) {
      return NextResponse.json({ error: 'This session has already been resolved', resolved: true }, { status: 410 })
    }

    return NextResponse.json(session)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { finalDraft } = await req.json()

    const coSession = await prisma.coSession.update({
      where: { id: params.id },
      data: {
        currentDraft: finalDraft,
        resolvedAt: new Date(),
      },
    })

    await prisma.conflict.update({
      where: { id: coSession.conflictId },
      data: { status: 'RESOLVED' },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
