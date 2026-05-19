import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { OrderForm } from '@/components/vendas/OrderForm'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Novo Pedido' }

export default async function NovoPedidoPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const platforms = await prisma.platformConfig.findMany({
    where:   { organizationId: profile.organizationId, isActive: true },
    orderBy: { name: 'asc' },
    select:  { platform: true, name: true, commissionRate: true, fixedFee: true },
  })

  return (
    <>
      <Header title="Novo Pedido" />
      <div className="mt-6">
        <OrderForm
          platforms={platforms.map(p => ({
            platform:       p.platform,
            name:           p.name,
            commissionRate: Number(p.commissionRate),
            fixedFee:       Number(p.fixedFee),
          }))}
        />
      </div>
    </>
  )
}
