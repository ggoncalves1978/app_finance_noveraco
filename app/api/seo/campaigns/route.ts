import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SeoCampaignStatus, SeoCampaignType } from '@prisma/client'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') ?? 25)))
  const platform = searchParams.get('platform')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where = {
    organizationId: profile.organizationId,
    ...(platform ? { platform } : {}),
    ...(status ? { status: status as SeoCampaignStatus } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [campaigns, total] = await Promise.all([
    prisma.seoCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { creator: { select: { name: true } } },
    }),
    prisma.seoCampaign.count({ where }),
  ])

  return NextResponse.json({ campaigns, total, page, pageSize })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await request.json()
  const { name, platform, type, budget, startDate, endDate, notes } = body

  if (!name || !platform || !type) {
    return NextResponse.json(
      { error: 'Nome, plataforma e tipo são obrigatórios' },
      { status: 422 }
    )
  }

  const campaign = await prisma.seoCampaign.create({
    data: {
      organizationId: profile.organizationId,
      name,
      platform,
      type: type as SeoCampaignType,
      budget: budget ? parseFloat(budget) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
      createdBy: user.id,
    },
    include: { creator: { select: { name: true } } },
  })

  return NextResponse.json({ campaign }, { status: 201 })
}
