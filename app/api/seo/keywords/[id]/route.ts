import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { KeywordCompetition } from '@prisma/client'

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
  const keyword = await prisma.seoKeyword.findUnique({
    where: { id },
    include: { organization: { select: { id: true } } },
  })

  if (!keyword) return NextResponse.json({ error: 'Palavra-chave não encontrada' }, { status: 404 })
  if (keyword.organizationId !== profile.organizationId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const {
    keyword: newKeyword,
    searchVolume,
    competition,
    currentPosition,
    targetPosition,
    notes,
  } = body

  const updated = await prisma.seoKeyword.update({
    where: { id },
    data: {
      ...(newKeyword ? { keyword: newKeyword } : {}),
      ...(searchVolume !== undefined ? { searchVolume: searchVolume ? parseInt(searchVolume) : null } : {}),
      ...(competition ? { competition: competition as KeywordCompetition } : {}),
      ...(currentPosition !== undefined ? { currentPosition: currentPosition ? parseInt(currentPosition) : null } : {}),
      ...(targetPosition !== undefined ? { targetPosition: targetPosition ? parseInt(targetPosition) : null } : {}),
      ...(notes !== undefined ? { notes } : {}),
      lastChecked: new Date(),
    },
    include: { product: { select: { sku: true, name: true } } },
  })

  return NextResponse.json({ keyword: updated })
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
  const keyword = await prisma.seoKeyword.findUnique({ where: { id } })

  if (!keyword) return NextResponse.json({ error: 'Palavra-chave não encontrada' }, { status: 404 })
  if (keyword.organizationId !== profile.organizationId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await prisma.seoKeyword.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
