import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PricingCalculator } from '@/lib/pricing/calculator'
import { compareSchema } from '@/lib/validations/pricing-schemas'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await request.json()
  const parsed = compareSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { costPrice, shippingCost } = parsed.data

  const platforms = await prisma.platformConfig.findMany({
    where: { organizationId: profile.organizationId, isActive: true },
    orderBy: { name: 'asc' },
  })

  const defaultMargin = 12.5

  const results = platforms.map((p) => {
    try {
      const result = PricingCalculator.calculate({
        costPrice,
        shippingCost,
        commissionRate: Number(p.commissionRate),
        fixedFee:       Number(p.fixedFee),
        taxRate:        Number(p.taxRate),
        desiredMargin:  defaultMargin,
      })
      return { platform: p.platform, name: p.name, ...result, error: null }
    } catch {
      return { platform: p.platform, name: p.name, suggestedPrice: 0, netProfit: 0, netMarginPercent: 0, error: 'Cálculo inválido' }
    }
  })

  return NextResponse.json({ results, defaultMargin })
}
