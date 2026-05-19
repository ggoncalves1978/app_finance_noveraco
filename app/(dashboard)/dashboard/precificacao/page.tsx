import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PricingHistoryTable } from '@/components/pricing/PricingHistoryTable'
import { PricingStats } from '@/components/pricing/PricingStats'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Precificação' }

export default async function PrecificacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; platform?: string }>
}) {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const params  = await searchParams
  const page    = Math.max(1, Number(params.page ?? 1))
  const platform = params.platform

  const pageSize = 50
  const where = {
    organizationId: profile.organizationId,
    ...(platform ? { platform } : {}),
  }

  const [pricings, total, stats] = await Promise.all([
    prisma.pricing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        product: { select: { sku: true, name: true } },
        creator: { select: { name: true } },
      },
    }),
    prisma.pricing.count({ where }),
    prisma.pricing.aggregate({
      where: { organizationId: profile.organizationId },
      _avg: { netProfit: true, netMarginPercent: true },
      _sum: { netProfit: true },
    }),
  ])

  const rows = pricings.map((p) => ({
    id:               p.id,
    createdAt:        p.createdAt.toISOString(),
    productSku:       p.product?.sku ?? '—',
    productName:      p.product?.name ?? '—',
    platform:         p.platform,
    costPrice:        Number(p.costPrice),
    suggestedPrice:   Number(p.suggestedPrice),
    netProfit:        Number(p.netProfit),
    netMarginPercent: Number(p.netMarginPercent),
    createdBy:        p.creator?.name ?? '—',
  }))

  return (
    <>
      <Header title="Precificação" />

      <div className="mt-6 space-y-6">
        <PricingStats
          totalPricings={total}
          avgProfit={Number(stats._avg.netProfit) || 0}
          avgMargin={Number(stats._avg.netMarginPercent) || 0}
          totalProfit={Number(stats._sum.netProfit) || 0}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} precificação{total !== 1 ? 'ões' : ''} encontrada{total !== 1 ? 's' : ''}
          </p>
          <Link href="/dashboard/precificacao/nova">
            <Button>Nova Precificação</Button>
          </Link>
        </div>

        <PricingHistoryTable rows={rows} total={total} page={page} pageSize={pageSize} />
      </div>
    </>
  )
}
