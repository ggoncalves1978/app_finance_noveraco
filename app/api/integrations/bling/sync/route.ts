import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getBlingConfig, fetchBlingOrders, mapBlingOrder } from '@/lib/integrations/bling'
import { OrderStatus } from '@prisma/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  if (profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem sincronizar' }, { status: 403 })
  }

  let config
  try {
    config = getBlingConfig()
  } catch {
    return NextResponse.json(
      { error: 'Integração Bling não configurada', configured: false },
      { status: 503 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const { dateFrom, dateTo } = body

  try {
    const rawOrders = await fetchBlingOrders(config, { dateFrom, dateTo })
    const mapped = rawOrders.map(mapBlingOrder)

    let created = 0
    let skipped = 0

    for (const order of mapped) {
      const exists = await prisma.order.findFirst({
        where: { organizationId: profile.organizationId, externalId: order.externalId, source: 'BLING' },
        select: { id: true },
      })

      if (exists) { skipped++; continue }

      const grossRevenue = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
      const netProfit    = grossRevenue - order.platformFee - order.shippingCost - order.productCost - order.taxes
      const netMargin    = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

      await prisma.order.create({
        data: {
          organizationId: profile.organizationId,
          externalId:     order.externalId,
          platform:       order.platform,
          orderDate:      new Date(order.orderDate),
          status:         order.status as OrderStatus,
          customerName:   order.customerName,
          grossRevenue:   parseFloat(grossRevenue.toFixed(2)),
          platformFee:    order.platformFee,
          shippingCost:   order.shippingCost,
          productCost:    order.productCost,
          taxes:          order.taxes,
          netProfit:      parseFloat(netProfit.toFixed(2)),
          netMargin:      parseFloat(netMargin.toFixed(2)),
          source:         'BLING',
          createdBy:      user.id,
          items: {
            create: order.items.map(i => ({
              sku:         i.sku,
              productName: i.productName,
              quantity:    i.quantity,
              unitPrice:   i.unitPrice,
              unitCost:    i.unitCost,
              totalPrice:  parseFloat((i.quantity * i.unitPrice).toFixed(2)),
            })),
          },
        },
      })

      created++
    }

    return NextResponse.json({ synced: created, skipped })
  } catch (err: any) {
    if (err.message === 'NOT_IMPLEMENTED') {
      return NextResponse.json(
        { error: 'Integração em desenvolvimento', synced: 0, skipped: 0 },
        { status: 501 }
      )
    }
    return NextResponse.json({ error: 'Falha na sincronização com Bling' }, { status: 502 })
  }
}
