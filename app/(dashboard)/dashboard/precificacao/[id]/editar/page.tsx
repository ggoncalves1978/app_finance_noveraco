import { notFound, redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PricingCalculator } from '@/components/pricing/PricingCalculator'
import { getUserProfile } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Editar Precificação' }

export default async function EditarPrecificacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const { id } = await params

  const [pricing, products, platforms] = await Promise.all([
    prisma.pricing.findFirst({
      where:   { id, organizationId: profile.organizationId },
      include: { product: { select: { sku: true, name: true } } },
    }),
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

  if (!pricing) notFound()

  const initialValues = {
    productName:    pricing.product?.name ?? '',
    productSku:     pricing.product?.sku  ?? '',
    platform:       pricing.platform,
    costPrice:      Number(pricing.costPrice),
    shippingCost:   Number(pricing.shippingCost),
    commissionRate: Number(pricing.commissionRate),
    fixedFee:       Number(pricing.fixedFee),
    taxRate:        Number(pricing.taxRate),
    desiredMargin:  Number(pricing.desiredMargin),
    notes:          pricing.notes ?? '',
  }

  return (
    <>
      <Header title="Editar Precificação" />
      <div className="mt-6">
        <PricingCalculator
          products={products.map((p) => ({ ...p, costPrice: Number(p.costPrice) }))}
          platforms={platforms.map((p) => ({
            ...p,
            commissionRate: Number(p.commissionRate),
            fixedFee:       Number(p.fixedFee),
            taxRate:        Number(p.taxRate),
          }))}
          pricingId={id}
          initialValues={initialValues}
        />
      </div>
    </>
  )
}
