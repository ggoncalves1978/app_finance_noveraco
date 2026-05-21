import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { KeywordCompetition } from '@prisma/client'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') ?? 50)))
  const platform = searchParams.get('platform')
  const productId = searchParams.get('productId')
  const search = searchParams.get('search')

  const where = {
    organizationId: profile.organizationId,
    ...(platform ? { platform } : {}),
    ...(productId ? { productId } : {}),
    ...(search ? { keyword: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [keywords, total] = await Promise.all([
    prisma.seoKeyword.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { product: { select: { sku: true, name: true } } },
    }),
    prisma.seoKeyword.count({ where }),
  ])

  return NextResponse.json({ keywords, total, page, pageSize })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.user.findUnique({ where: { id: user.id } })
  if (!profile) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await request.json()
  const { keyword, platform, productId, searchVolume, competition, targetPosition, notes } = body

  if (!keyword || !platform) {
    return NextResponse.json(
      { error: 'Palavra-chave e plataforma são obrigatórias' },
      { status: 422 }
    )
  }

  const keyword_obj = await prisma.seoKeyword.create({
    data: {
      organizationId: profile.organizationId,
      keyword,
      platform,
      productId: productId || null,
      searchVolume: searchVolume ? parseInt(searchVolume) : null,
      competition: competition as KeywordCompetition | null,
      targetPosition: targetPosition ? parseInt(targetPosition) : null,
      notes,
    },
    include: { product: { select: { sku: true, name: true } } },
  })

  return NextResponse.json({ keyword: keyword_obj }, { status: 201 })
}
