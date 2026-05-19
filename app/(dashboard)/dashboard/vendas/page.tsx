import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { KpiCards } from '@/components/vendas/KpiCards'
import { RevenueChart } from '@/components/vendas/RevenueChart'
import { PlatformChart } from '@/components/vendas/PlatformChart'
import { OrdersTable } from '@/components/vendas/OrdersTable'
import { OrderStatus } from '@prisma/client'

export const metadata = { title: 'Vendas' }

const PLATFORM_LABELS: Record<string, string> = {
  mercado_livre_classico: 'ML Clássico',
  mercado_livre_premium:  'ML Premium',
  shopee:                 'Shopee',
  amazon:                 'Amazon',
  site_proprio:           'Site Próprio',
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const ACTIVE = [OrderStatus.PENDENTE, OrderStatus.PAGO, OrderStatus.ENVIADO, OrderStatus.ENTREGUE]

export default async function VendasPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [kpiAgg, orderCountMonth, chartOrders, initialOrders, initialTotal] = await Promise.all([
    prisma.order.aggregate({
      where: {
        organizationId: profile.organizationId,
        orderDate:      { gte: monthStart, lte: monthEnd },
        status:         { in: ACTIVE },
      },
      _sum: { grossRevenue: true, netProfit: true },
      _avg: { netMargin: true },
    }),
    prisma.order.count({
      where: {
        organizationId: profile.organizationId,
        orderDate:      { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.order.findMany({
      where: {
        organizationId: profile.organizationId,
        orderDate:      { gte: sixMonthsAgo },
        status:         { in: ACTIVE },
      },
      select: { orderDate: true, grossRevenue: true, netProfit: true, platform: true },
    }),
    prisma.order.findMany({
      where:   { organizationId: profile.organizationId },
      orderBy: { orderDate: 'desc' },
      take:    25,
      include: {
        items:   { select: { productName: true, quantity: true, unitPrice: true } },
        creator: { select: { name: true } },
      },
    }),
    prisma.order.count({ where: { organizationId: profile.organizationId } }),
  ])

  // Chart: receita x lucro por mês (últimos 6 meses)
  const monthMap: Record<string, { revenue: number; profit: number }> = {}
  chartOrders.forEach(o => {
    const key = `${o.orderDate.getFullYear()}-${String(o.orderDate.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap[key]) monthMap[key] = { revenue: 0, profit: 0 }
    monthMap[key].revenue += Number(o.grossRevenue)
    monthMap[key].profit  += Number(o.netProfit)
  })

  const revenueChartData = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month:   MONTH_NAMES[d.getMonth()],
      revenue: parseFloat((monthMap[key]?.revenue ?? 0).toFixed(2)),
      profit:  parseFloat((monthMap[key]?.profit  ?? 0).toFixed(2)),
    }
  })

  // Chart: distribuição por plataforma
  const platformMap: Record<string, { orders: number; revenue: number }> = {}
  chartOrders.forEach(o => {
    if (!platformMap[o.platform]) platformMap[o.platform] = { orders: 0, revenue: 0 }
    platformMap[o.platform].orders  += 1
    platformMap[o.platform].revenue += Number(o.grossRevenue)
  })

  const platformChartData = Object.entries(platformMap).map(([platform, data]) => ({
    name:    PLATFORM_LABELS[platform] ?? platform,
    value:   data.orders,
    revenue: parseFloat(data.revenue.toFixed(2)),
  }))

  const rows = initialOrders.map(o => ({
    id:           o.id,
    orderDate:    o.orderDate.toISOString(),
    externalId:   o.externalId ?? null,
    platform:     o.platform,
    status:       o.status,
    customerName: o.customerName ?? null,
    grossRevenue: Number(o.grossRevenue),
    netProfit:    Number(o.netProfit),
    netMargin:    Number(o.netMargin),
    createdBy:    o.creator?.name ?? '—',
    items:        o.items.map(i => ({ productName: i.productName, quantity: i.quantity })),
  }))

  return (
    <>
      <Header title="Vendas" />

      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {initialTotal} pedido{initialTotal !== 1 ? 's' : ''} no total
          </p>
          <Link href="/dashboard/vendas/novo">
            <Button>Novo Pedido</Button>
          </Link>
        </div>

        <KpiCards
          grossRevenue={Number(kpiAgg._sum.grossRevenue ?? 0)}
          netProfit={Number(kpiAgg._sum.netProfit ?? 0)}
          avgMargin={Number(kpiAgg._avg.netMargin ?? 0)}
          orderCount={orderCountMonth}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={revenueChartData} />
          <PlatformChart data={platformChartData} />
        </div>

        <OrdersTable initialOrders={rows} initialTotal={initialTotal} />
      </div>
    </>
  )
}
