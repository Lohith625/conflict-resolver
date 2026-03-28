// Using Groq API — free tier, 14,400 req/day, works globally including India
// Get your free key at console.groq.com

export interface AnalysisResult {
  their_underlying_need: string
  other_party_likely_feels: string
  escalation_trigger: string
  common_ground: string
  blind_spot: string
  title: string
}

export interface DraftsResult {
  direct: string
  gentle: string
  curious: string
}

export interface ModerationResult {
  flag: boolean
  flagged_phrase: string | null
  suggestion: string | null
  tone_score: number
}

export interface PatternResult {
  recurring_theme: string
  common_trigger: string
  your_pattern: string
  honest_insight: string
  one_thing_to_try: string
}

async function callGroq(prompt: string, maxTokens = 1024): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in your .env.local file')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond with valid JSON only. No markdown, no backticks, no explanation — just the raw JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  return text.replace(/```json|```/g, '').trim()
}

export async function analyzeConflict(
  description: string,
  userRole: string,
  otherRole?: string
): Promise<AnalysisResult> {
  const prompt = `You are a neutral conflict mediator. Do NOT take sides.

Conflict: "${description}"
Their role: "${userRole}"
${otherRole ? `Other person's perspective: "${otherRole}"` : ''}

Return this exact JSON structure with no extra text:
{
  "title": "4-6 word plain summary of the conflict",
  "their_underlying_need": "what this person actually wants beneath their stated position",
  "other_party_likely_feels": "the other side's probable emotional experience",
  "escalation_trigger": "the specific thing that caused this to blow up",
  "common_ground": "what both sides almost certainly agree on",
  "blind_spot": "something honest the user may not be seeing about their own role"
}

Be honest. If the user contributed to the problem, say so gently but clearly.`

  const text = await callGroq(prompt)
  return JSON.parse(text)
}

export async function generateDrafts(
  description: string,
  analysis: AnalysisResult
): Promise<DraftsResult> {
  const prompt = `Help someone send a message to resolve this conflict: "${description}"
Common ground: "${analysis.common_ground}"
Other person likely feels: "${analysis.other_party_likely_feels}"

Return this exact JSON with no extra text:
{
  "direct": "honest and clear message, max 4 sentences, no softening",
  "gentle": "warm empathetic message leading with the other person's experience, max 4 sentences",
  "curious": "message opening with a genuine question making no accusations, max 4 sentences"
}

Rules: never start with I feel like you, acknowledge the other person in each version, no therapy jargon, sound like a real person wrote it.`

  const text = await callGroq(prompt)
  return JSON.parse(text)
}

export async function moderateDraft(
  draft: string,
  conflictSummary: string
): Promise<ModerationResult> {
  if (draft.trim().length < 20) {
    return { flag: false, flagged_phrase: null, suggestion: null, tone_score: 7 }
  }

  const prompt = `Review this conflict resolution message for harmful language.

Draft: "${draft}"
Context: "${conflictSummary}"

Only flag genuinely problematic patterns like accusatory absolutes you always you never, dismissive phrases not a big deal overreacting, vague non-commitments I will try to be better.

Return this exact JSON with no extra text:
{
  "flag": true or false,
  "flagged_phrase": "exact phrase from the draft or null",
  "suggestion": "a gentler alternative or null",
  "tone_score": a number from 1 to 10 where 1 is inflammatory and 10 is constructive
}

Do NOT flag direct or assertive language. Only flag genuinely harmful patterns.`

  try {
    const text = await callGroq(prompt)
    return JSON.parse(text)
  } catch {
    return { flag: false, flagged_phrase: null, suggestion: null, tone_score: 7 }
  }
}

export async function analyzePatterns(
  conflicts: Array<{ title: string; description: string; analysis: any }>
): Promise<PatternResult> {
  const summaries = conflicts.map((c, i) =>
    `Conflict ${i + 1}: "${c.title}" — Blind spot: "${c.analysis?.blind_spot}" — Trigger: "${c.analysis?.escalation_trigger}"`
  ).join('\n')

  const prompt = `You are an honest compassionate coach reviewing someone's conflict history.

Here are their recent conflicts:
${summaries}

Look for patterns and return this exact JSON with no extra text:
{
  "recurring_theme": "the common thread across these conflicts in one sentence",
  "common_trigger": "what tends to set off their conflicts",
  "your_pattern": "how this person tends to behave or react in conflicts",
  "honest_insight": "one honest observation that might be hard to hear but would help them grow",
  "one_thing_to_try": "one specific actionable behaviour change they could make"
}

Be direct and honest. Genuine insight not validation. Keep each field to 1-2 sentences.`

  const text = await callGroq(prompt, 800)
  return JSON.parse(text)
}
