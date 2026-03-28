import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzePatterns } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get last 10 analyzed conflicts
    const conflicts = await prisma.conflict.findMany({
      where: {
        userId: session.user.id,
        status: { not: 'DRAFT' },
        analysis: { not: undefined },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        title: true,
        description: true,
        analysis: true,
      },
    })

    if (conflicts.length < 2) {
      return NextResponse.json(
        { error: 'You need at least 2 conflicts for pattern analysis' },
        { status: 400 }
      )
    }

    const patterns = await analyzePatterns(
      conflicts.map(c => ({
        title: c.title,
        description: c.description,
        analysis: c.analysis,
      }))
    )

    return NextResponse.json(patterns)
  } catch (err: any) {
    console.error('[/api/patterns]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
