import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SeoCampaignStatus } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const campaign = await prisma.seoCampaign.findUnique({
    where: { id },
    include: { organization: { select: { id: true } } },
  })

  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (campaign.organizationId !== profile.organizationId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const { name, status, budget, spent, impressions, clicks, conversions, revenue, notes } = body

  const updated = await prisma.seoCampaign.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(status ? { status: status as SeoCampaignStatus } : {}),
      ...(budget !== undefined ? { budget: budget ? parseFloat(budget) : null } : {}),
      ...(spent !== undefined ? { spent: parseFloat(spent) } : {}),
      ...(impressions !== undefined ? { impressions: parseInt(impressions) } : {}),
      ...(clicks !== undefined ? { clicks: parseInt(clicks) } : {}),
      ...(conversions !== undefined ? { conversions: parseInt(conversions) } : {}),
      ...(revenue !== undefined ? { revenue: parseFloat(revenue) } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { creator: { select: { name: true } } },
  })

  return NextResponse.json({ campaign: updated })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const campaign = await prisma.seoCampaign.findUnique({ where: { id } })

  if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (campaign.organizationId !== profile.organizationId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await prisma.seoCampaign.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
