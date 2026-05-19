import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { updateOrderSchema } from '@/lib/validations/order-schemas'

type RouteCtx = { params: Promise<{ id: string }> }

async function getAuthorized(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado', status: 401, order: null }

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return { error: 'Usuário não encontrado', status: 404, order: null }

  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: profile.organizationId },
  })
  if (!order) return { error: 'Pedido não encontrado', status: 404, order: null }

  return { error: null, status: 200, order }
}

export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status, order } = await getAuthorized(id)
  if (error) return NextResponse.json({ error }, { status })
  return NextResponse.json({ order })
}

export async function PATCH(request: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status, order: existing } = await getAuthorized(id)
  if (error || !existing) return NextResponse.json({ error }, { status })

  const body = await request.json()
  const parsed = updateOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const data = parsed.data

  const grossRevenue = Number(existing.grossRevenue)
  const platformFee  = data.platformFee  ?? Number(existing.platformFee)
  const shippingCost = data.shippingCost ?? Number(existing.shippingCost)
  const productCost  = data.productCost  ?? Number(existing.productCost)
  const taxes        = data.taxes        ?? Number(existing.taxes)

  const netProfit = parseFloat((grossRevenue - platformFee - shippingCost - productCost - taxes).toFixed(2))
  const netMargin = grossRevenue > 0
    ? parseFloat(((netProfit / grossRevenue) * 100).toFixed(2))
    : 0

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(data.status        !== undefined ? { status:        data.status }        : {}),
      ...(data.customerName  !== undefined ? { customerName:  data.customerName }  : {}),
      ...(data.customerCity  !== undefined ? { customerCity:  data.customerCity }  : {}),
      ...(data.customerState !== undefined ? { customerState: data.customerState } : {}),
      ...(data.platformFee   !== undefined ? { platformFee:   data.platformFee }   : {}),
      ...(data.shippingCost  !== undefined ? { shippingCost:  data.shippingCost }  : {}),
      ...(data.productCost   !== undefined ? { productCost:   data.productCost }   : {}),
      ...(data.taxes         !== undefined ? { taxes:         data.taxes }         : {}),
      ...(data.notes         !== undefined ? { notes:         data.notes }         : {}),
      netProfit,
      netMargin,
    },
  })

  return NextResponse.json({ order: updated })
}

export async function DELETE(_req: Request, { params }: RouteCtx) {
  const { id } = await params
  const { error, status } = await getAuthorized(id)
  if (error) return NextResponse.json({ error }, { status })

  await prisma.order.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
