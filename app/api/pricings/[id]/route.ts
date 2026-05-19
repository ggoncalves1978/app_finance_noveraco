import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PricingCalculator } from '@/lib/pricing/calculator'
import { updateSchema } from '@/lib/validations/pricing-schemas'

type RouteCtx = { params: Promise<{ id: string }> }

async function getAuthorized(pricingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado', status: 401, pricing: null }

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return { error: 'Usuário não encontrado', status: 404, pricing: null }

  const pricing = await prisma.pricing.findFirst({
    where: { id: pricingId, organizationId: profile.organizationId },
    include: { product: { select: { sku: true, name: true } } },
  })
  if (!pricing) return { error: 'Precificação não encontrada', status: 404, pricing: null }

  return { error: null, status: 200, pricing }
}

export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status, pricing } = await getAuthorized(id)
  if (error) return NextResponse.json({ error }, { status })
  return NextResponse.json({ pricing })
}

export async function PATCH(request: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status, pricing: existing } = await getAuthorized(id)
  if (error || !existing) return NextResponse.json({ error }, { status })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const data = parsed.data

  const merged = {
    costPrice:      data.costPrice      ?? Number(existing.costPrice),
    shippingCost:   data.shippingCost   ?? Number(existing.shippingCost),
    commissionRate: data.commissionRate ?? Number(existing.commissionRate),
    fixedFee:       data.fixedFee       ?? Number(existing.fixedFee),
    taxRate:        data.taxRate        ?? Number(existing.taxRate),
    desiredMargin:  data.desiredMargin  ?? Number(existing.desiredMargin),
  }

  const validationError = PricingCalculator.validate(merged)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 422 })

  const result = PricingCalculator.calculate(merged)

  const updated = await prisma.pricing.update({
    where: { id },
    data: {
      ...(data.platform       !== undefined ? { platform:       data.platform }       : {}),
      ...(data.costPrice      !== undefined ? { costPrice:      data.costPrice }      : {}),
      ...(data.shippingCost   !== undefined ? { shippingCost:   data.shippingCost }   : {}),
      ...(data.commissionRate !== undefined ? { commissionRate: data.commissionRate } : {}),
      ...(data.fixedFee       !== undefined ? { fixedFee:       data.fixedFee }       : {}),
      ...(data.taxRate        !== undefined ? { taxRate:        data.taxRate }        : {}),
      ...(data.desiredMargin  !== undefined ? { desiredMargin:  data.desiredMargin }  : {}),
      ...(data.notes          !== undefined ? { notes:          data.notes }          : {}),
      suggestedPrice:   result.suggestedPrice,
      netProfit:        result.netProfit,
      netMarginPercent: result.netMarginPercent,
    },
    include: { product: { select: { sku: true, name: true } } },
  })

  return NextResponse.json({ pricing: updated, result })
}

export async function DELETE(_req: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status } = await getAuthorized(id)
  if (error) return NextResponse.json({ error }, { status })

  await prisma.pricing.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
