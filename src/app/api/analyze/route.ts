import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeConflict, generateDrafts } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { description, userRole, otherRole } = body

    if (!description?.trim() || !userRole?.trim()) {
      return NextResponse.json({ error: 'Description and your role are required' }, { status: 400 })
    }

    // Run both AI calls — perspective analysis first, then drafts using the analysis
    const analysis = await analyzeConflict(description, userRole, otherRole)
    const drafts = await generateDrafts(description, analysis)

    // Save to DB
    const conflict = await prisma.conflict.create({
      data: {
        userId: session.user.id,
        title: analysis.title,
        description,
        userRole,
        otherRole: otherRole || null,
        analysis,
        drafts,
        status: 'ANALYZED',
      },
    })

    return NextResponse.json({ conflictId: conflict.id })
  } catch (err: any) {
    console.error('[/api/analyze]', err)
    return NextResponse.json(
      { error: err.message || 'Analysis failed — please try again' },
      { status: 500 }
    )
  }
}
