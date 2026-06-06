import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSelle7Config, fetchSelle7Orders } from '@/lib/integrations/selle7'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  let config
  try {
    config = getSelle7Config()
  } catch {
    return NextResponse.json(
      { error: 'Integração Selle7 não configurada', configured: false },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const params = {
    status:   searchParams.get('status')   ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
  }

  try {
    const orders = await fetchSelle7Orders(config, params)
    return NextResponse.json({ orders })
  } catch (err: any) {
    if (err.message === 'NOT_IMPLEMENTED') {
      return NextResponse.json(
        { error: 'Integração em desenvolvimento', orders: [] },
        { status: 501 }
      )
    }
    return NextResponse.json({ error: 'Falha ao buscar pedidos do Selle7' }, { status: 502 })
  }
}
