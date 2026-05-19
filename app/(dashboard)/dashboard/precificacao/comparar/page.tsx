import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PlatformComparison } from '@/components/pricing/PlatformComparison'
import { getUserProfile } from '@/lib/auth/session'

export const metadata = { title: 'Comparar Plataformas' }

export default async function CompararPlataformasPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  return (
    <>
      <Header title="Comparar Preços por Plataforma" />
      <div className="mt-6">
        <PlatformComparison />
      </div>
    </>
  )
}
