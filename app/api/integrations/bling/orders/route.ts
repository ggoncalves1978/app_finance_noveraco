import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getBlingConfig, fetchBlingOrders } from '@/lib/integrations/bling'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  let config
  try {
    config = getBlingConfig()
  } catch {
    return NextResponse.json(
      { error: 'Integração Bling não configurada', configured: false },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const params = {
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
    page:     Number(searchParams.get('page') ?? 1),
  }

  try {
    const orders = await fetchBlingOrders(config, params)
    return NextResponse.json({ orders })
  } catch (err: any) {
    if (err.message === 'NOT_IMPLEMENTED') {
      return NextResponse.json(
        { error: 'Integração em desenvolvimento', orders: [] },
        { status: 501 }
      )
    }
    return NextResponse.json({ error: 'Falha ao buscar pedidos do Bling' }, { status: 502 })
  }
}
