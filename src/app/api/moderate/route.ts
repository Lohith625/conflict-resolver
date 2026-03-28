import { NextRequest, NextResponse } from 'next/server'
import { moderateDraft } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { draft, conflictSummary } = await req.json()

    if (!draft?.trim()) {
      return NextResponse.json({ flag: false, flagged_phrase: null, suggestion: null, tone_score: 7 })
    }

    const result = await moderateDraft(draft, conflictSummary || '')
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/moderate]', err)
    // Never crash the co-draft room over a moderation failure — return neutral score
    return NextResponse.json({ flag: false, flagged_phrase: null, suggestion: null, tone_score: 7 })
  }
}
