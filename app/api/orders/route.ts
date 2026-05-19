import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/validations/order-schemas'
import { OrderStatus } from '@prisma/client'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const page     = Math.max(1, Number(searchParams.get('page')     ?? 1))
  const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') ?? 25)))
  const platform = searchParams.get('platform') ?? undefined
  const status   = searchParams.get('status')   ?? undefined
  const dateFrom = searchParams.get('dateFrom') ?? undefined
  const dateTo   = searchParams.get('dateTo')   ?? undefined
  const search   = searchParams.get('search')   ?? undefined

  const validStatuses = Object.values(OrderStatus) as string[]

  const where = {
    organizationId: profile.organizationId,
    ...(platform ? { platform } : {}),
    ...(status && validStatuses.includes(status) ? { status: status as OrderStatus } : {}),
    ...((dateFrom || dateTo) ? {
      orderDate: {
        ...(dateFrom ? { gte: new Date(dateFrom) }             : {}),
        ...(dateTo   ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
      },
    } : {}),
    ...(search ? {
      OR: [
        { externalId:   { contains: search, mode: 'insensitive' as const } },
        { customerName: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { orderDate: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
      include: {
        items:   { select: { productName: true, quantity: true, unitPrice: true } },
        creator: { select: { name: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pageSize })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const data = parsed.data

  const grossRevenue = parseFloat(
    data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)
  )
  const netProfit = parseFloat(
    (grossRevenue - data.platformFee - data.shippingCost - data.productCost - data.taxes).toFixed(2)
  )
  const netMargin = grossRevenue > 0
    ? parseFloat(((netProfit / grossRevenue) * 100).toFixed(2))
    : 0

  const order = await prisma.order.create({
    data: {
      organizationId: profile.organizationId,
      platform:       data.platform,
      orderDate:      new Date(data.orderDate),
      externalId:     data.externalId,
      status:         data.status as OrderStatus,
      customerName:   data.customerName,
      customerCity:   data.customerCity,
      customerState:  data.customerState,
      grossRevenue,
      platformFee:    data.platformFee,
      shippingCost:   data.shippingCost,
      productCost:    data.productCost,
      taxes:          data.taxes,
      netProfit,
      netMargin,
      notes:          data.notes,
      source:         'MANUAL',
      createdBy:      user.id,
      items: {
        create: data.items.map(item => ({
          productId:   item.productId ?? null,
          sku:         item.sku,
          productName: item.productName,
          quantity:    item.quantity,
          unitPrice:   item.unitPrice,
          unitCost:    item.unitCost,
          totalPrice:  parseFloat((item.quantity * item.unitPrice).toFixed(2)),
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ order }, { status: 201 })
}
