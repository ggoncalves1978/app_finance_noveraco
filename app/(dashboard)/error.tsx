'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Erro ao carregar o dashboard</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || 'Ocorreu um erro inesperado. Verifique a conexão com o banco de dados.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">Digest: {error.digest}</p>
      )}
      <Button onClick={reset} variant="outline">
        Tentar novamente
      </Button>
    </div>
  )
}
