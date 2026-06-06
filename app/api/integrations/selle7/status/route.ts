import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getSelle7Config, checkSelle7Status } from '@/lib/integrations/selle7'

export async function GET() {
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

  try {
    const result = await checkSelle7Status(config)
    return NextResponse.json(result)
  } catch (err: any) {
    if (err.message === 'NOT_IMPLEMENTED') {
      return NextResponse.json(
        { configured: true, connected: false, message: 'Integração em desenvolvimento' },
        { status: 501 }
      )
    }
    return NextResponse.json({ error: 'Falha ao verificar conexão Selle7' }, { status: 502 })
  }
}
