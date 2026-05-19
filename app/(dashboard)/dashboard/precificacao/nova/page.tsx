import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PricingCalculator } from '@/components/pricing/PricingCalculator'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Nova Precificação' }

export default async function NovaPrecificacaoPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const [products, platforms] = await Promise.all([
    prisma.product.findMany({
      where:   { organizationId: profile.organizationId, isActive: true },
      orderBy: { name: 'asc' },
      select:  { id: true, sku: true, name: true, costPrice: true },
    }),
    prisma.platformConfig.findMany({
      where:   { organizationId: profile.organizationId, isActive: true },
      orderBy: { name: 'asc' },
      select:  { platform: true, name: true, commissionRate: true, fixedFee: true, taxRate: true },
    }),
  ])

  return (
    <>
      <Header title="Nova Precificação" />
      <div className="mt-6">
        <PricingCalculator
          products={products.map((p) => ({ ...p, costPrice: Number(p.costPrice) }))}
          platforms={platforms.map((p) => ({
            ...p,
            commissionRate: Number(p.commissionRate),
            fixedFee:       Number(p.fixedFee),
            taxRate:        Number(p.taxRate),
          }))}
        />
      </div>
    </>
  )
}
