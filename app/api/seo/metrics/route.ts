import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const MONTH_LABELS: Record<number, string> = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Build the last 6 months window (oldest → newest)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_LABELS[d.getMonth() + 1] }
  })

  // Aggregate by month of campaign creation; startDate preferred when set
  const rows = await prisma.$queryRaw<
    { year: number; month: number; impressions: bigint; clicks: bigint; conversions: bigint }[]
  >`
    SELECT
      EXTRACT(YEAR  FROM COALESCE(start_date, created_at))::int AS year,
      EXTRACT(MONTH FROM COALESCE(start_date, created_at))::int AS month,
      SUM(impressions)::bigint  AS impressions,
      SUM(clicks)::bigint       AS clicks,
      SUM(conversions)::bigint  AS conversions
    FROM seo_campaigns
    WHERE
      organization_id = ${profile.organizationId}::uuid
      AND COALESCE(start_date, created_at) >= DATE_TRUNC('month', NOW() - INTERVAL '5 months')
    GROUP BY year, month
    ORDER BY year, month
  `

  const lookup = new Map(rows.map(r => [`${r.year}-${r.month}`, r]))

  const data = months.map(({ year, month, label }) => {
    const row = lookup.get(`${year}-${month}`)
    return {
      month: label,
      impressions: row ? Number(row.impressions) : 0,
      clicks:      row ? Number(row.clicks)      : 0,
      conversions: row ? Number(row.conversions) : 0,
    }
  })

  return NextResponse.json({ data })
}
