import { redirect } from 'next/navigation'

// O proxy.ts já redireciona / → /dashboard ou /login,
// mas este fallback garante que o Server Component também redirecione.
export default function RootPage() {
  redirect('/dashboard')
}
