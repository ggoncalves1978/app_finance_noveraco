'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

const compareSchema = z.object({
  costPrice: z.number().positive('Custo deve ser maior que 0'),
  shippingCost: z.number().nonnegative('Frete não pode ser negativo'),
})

type CompareFormValues = z.infer<typeof compareSchema>

interface ComparisonResult {
  platform: string
  name: string
  suggestedPrice: number
  netProfit: number
  netMarginPercent: number
  error: string | null
}

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const PLATFORM_COLORS: Record<string, { bg: string, border: string }> = {
  mercado_livre_classico: { bg: 'bg-yellow-50', border: 'border-yellow-200' },
  mercado_livre_premium: { bg: 'bg-yellow-50', border: 'border-yellow-200' },
  shopee: { bg: 'bg-red-50', border: 'border-red-200' },
  amazon: { bg: 'bg-orange-50', border: 'border-orange-200' },
  site_proprio: { bg: 'bg-blue-50', border: 'border-blue-200' },
}

export function PlatformComparison() {
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [defaultMargin, setDefaultMargin] = useState(12.5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CompareFormValues>({
    resolver: zodResolver(compareSchema),
    defaultValues: { costPrice: 0, shippingCost: 0 },
  })

  async function onSubmit(data: CompareFormValues) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pricings/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setError(typeof json.error === 'string' ? json.error : 'Erro ao comparar.')
        return
      }
      const json = await res.json() as { results: ComparisonResult[], defaultMargin: number }
      setResults(json.results)
      setDefaultMargin(json.defaultMargin)
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparador de Plataformas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-3">
            <div>
              <Label>Custo do Produto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="mt-1.5"
                {...register('costPrice', { valueAsNumber: true })}
              />
              {errors.costPrice && (
                <p className="text-xs text-destructive mt-1">{errors.costPrice.message}</p>
              )}
            </div>

            <div>
              <Label>Frete/Logística (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="mt-1.5"
                {...register('shippingCost', { valueAsNumber: true })}
              />
              {errors.shippingCost && (
                <p className="text-xs text-destructive mt-1">{errors.shippingCost.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm">
                <Label className="text-muted-foreground">Margem Padrão</Label>
                <p className="text-2xl font-bold mt-1.5 text-primary">{defaultMargin.toFixed(1)}%</p>
              </div>
            </div>
          </form>

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}

          <Button type="button" className="w-full mt-4" disabled={loading} onClick={handleSubmit(onSubmit)}>
            {loading ? 'Comparando…' : 'Comparar Plataformas'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {results.map((r) => {
            const colors = PLATFORM_COLORS[r.platform] || { bg: 'bg-gray-50', border: 'border-gray-200' }
            const isBest = results.every(res => res.netProfit <= r.netProfit)
            return (
              <div key={r.platform} className={`relative rounded-lg border-2 p-4 ${colors.bg} ${colors.border}`}>
                {isBest && results.length > 1 && (
                  <div className="absolute -top-3 -right-3 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    Melhor
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.platform}</p>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Preço Sugerido</p>
                    <p className="text-xl font-bold text-primary">{BRL(r.suggestedPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lucro</p>
                    <p className="text-lg font-semibold text-green-600">{BRL(r.netProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Margem</p>
                    <Badge variant="secondary">{r.netMarginPercent.toFixed(1)}%</Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            <p>Preencha os dados acima e clique em "Comparar Plataformas"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
