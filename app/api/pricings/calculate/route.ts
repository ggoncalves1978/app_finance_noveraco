import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PricingCalculator } from '@/lib/pricing/calculator'
import { calculateSchema } from '@/lib/validations/pricing-schemas'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await request.json()
  const parsed = calculateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const validationError = PricingCalculator.validate(data)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 })
  }

  // Busca produto por SKU ou cria um novo
  const product = await findOrCreateProduct({
    organizationId: profile.organizationId,
    name: data.productName,
    sku: data.productSku,
    costPrice: data.costPrice,
  })

  const result = PricingCalculator.calculate(data)

  const pricing = await prisma.pricing.create({
    data: {
      organizationId:   profile.organizationId,
      productId:        product.id,
      platform:         data.platform,
      costPrice:        data.costPrice,
      shippingCost:     data.shippingCost,
      commissionRate:   data.commissionRate,
      fixedFee:         data.fixedFee,
      taxRate:          data.taxRate,
      desiredMargin:    data.desiredMargin,
      suggestedPrice:   result.suggestedPrice,
      netProfit:        result.netProfit,
      netMarginPercent: result.netMarginPercent,
      notes:            data.notes,
      createdBy:        user.id,
    },
    include: { product: { select: { sku: true, name: true } } },
  })

  return NextResponse.json({ pricing, result })
}

async function findOrCreateProduct({
  organizationId,
  name,
  sku,
  costPrice,
}: {
  organizationId: string
  name: string
  sku?: string
  costPrice: number
}) {
  // Se tem SKU, tenta encontrar pelo SKU (upsert)
  if (sku) {
    return prisma.product.upsert({
      where: { organizationId_sku: { organizationId, sku } },
      update: { name, costPrice },
      create: { organizationId, sku, name, costPrice },
    })
  }

  // Sem SKU: busca por nome exato ou cria novo
  const existing = await prisma.product.findFirst({
    where: { organizationId, name },
  })
  if (existing) return existing

  // Gera SKU automático baseado no nome
  const autoSku = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12) + Date.now().toString().slice(-4)

  return prisma.product.create({
    data: { organizationId, sku: autoSku, name, costPrice },
  })
}
