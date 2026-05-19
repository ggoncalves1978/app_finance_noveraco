import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Dashboard' }

async function getStats(organizationId: string) {
  const [productCount, pricingCount, orderCount] = await Promise.all([
    prisma.product.count({ where: { organizationId, isActive: true } }),
    prisma.pricing.count({ where: { organizationId } }),
    prisma.order.count({ where: { organizationId } }),
  ])
  return { productCount, pricingCount, orderCount }
}

export default async function DashboardPage() {
  const profile = await getUserProfile()
  const stats = profile ? await getStats(profile.organizationId) : null

  return (
    <>
      <Header title="Dashboard" />

      <div className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.productCount ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Precificações salvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.pricingCount ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos lançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.orderCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Bem-vindo, {profile?.name?.split(' ')[0]}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Use a barra lateral para navegar entre os módulos.</p>
            <p><strong>Precificação</strong> — calcule e compare preços por plataforma.</p>
            <p><strong>Vendas</strong> — lance pedidos e acompanhe KPIs.</p>
            <p><strong>SEO</strong> — gerencie campanhas e palavras-chave.</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
