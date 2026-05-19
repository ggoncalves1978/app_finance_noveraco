import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const page     = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = 50
  const platform = searchParams.get('platform') ?? undefined
  const productId = searchParams.get('productId') ?? undefined

  const where = {
    organizationId: profile.organizationId,
    ...(platform   ? { platform }  : {}),
    ...(productId  ? { productId } : {}),
  }

  const [pricings, total] = await Promise.all([
    prisma.pricing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * pageSize,
      take:  pageSize,
      include: {
        product: { select: { sku: true, name: true } },
        creator: { select: { name: true } },
      },
    }),
    prisma.pricing.count({ where }),
  ])

  return NextResponse.json({ pricings, total, page, pageSize })
}
