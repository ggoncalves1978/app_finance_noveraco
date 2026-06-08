'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { calculateSchema } from '@/lib/validations/pricing-schemas'
import { PricingCalculator as Calc } from '@/lib/pricing/calculator'
import { ProductSearchDialog, type ProductOption } from './ProductSearchDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Platform {
  platform:       string
  name:           string
  commissionRate: number
  fixedFee:       number
  taxRate:        number
}

interface InitialValues {
  productName:    string
  productSku:     string
  platform:       string
  costPrice:      number
  shippingCost:   number
  commissionRate: number
  fixedFee:       number
  taxRate:        number
  desiredMargin:  number
  notes:          string
}

interface Props {
  products:      ProductOption[]
  platforms:     Platform[]
  pricingId?:    string
  initialValues?: InitialValues
}

type FormValues = {
  productName:    string
  productSku:     string
  platform:       string
  costPrice:      number
  shippingCost:   number
  commissionRate: number
  fixedFee:       number
  taxRate:        number
  desiredMargin:  number
  notes:          string
}

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function PricingCalculator({ products, platforms, pricingId, initialValues }: Props) {
  const router = useRouter()
  const [preview, setPreview]     = useState<{ price: number; profit: number; margin: number } | null>(null)
  const [saving,  setSaving]      = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(calculateSchema) as never,
      defaultValues: {
        productName:    initialValues?.productName    ?? '',
        productSku:     initialValues?.productSku     ?? '',
        platform:       initialValues?.platform       ?? '',
        shippingCost:   initialValues?.shippingCost   ?? 0,
        taxRate:        initialValues?.taxRate        ?? 0,
        fixedFee:       initialValues?.fixedFee       ?? 0,
        commissionRate: initialValues?.commissionRate ?? 0,
        desiredMargin:  initialValues?.desiredMargin  ?? 12.5,
        notes:          initialValues?.notes          ?? '',
        ...(initialValues?.costPrice !== undefined ? { costPrice: initialValues.costPrice } : {}),
      },
    })

  const watched = watch()

  // Preview em tempo real
  useEffect(() => {
    const v = watched
    if (!v.platform || !Number.isFinite(v.costPrice) || !Number.isFinite(v.commissionRate) || !v.desiredMargin) { setPreview(null); return }
    const err = Calc.validate({
      costPrice:      v.costPrice ?? 0,
      shippingCost:   v.shippingCost ?? 0,
      commissionRate: v.commissionRate ?? 0,
      fixedFee:       v.fixedFee ?? 0,
      taxRate:        v.taxRate ?? 0,
      desiredMargin:  v.desiredMargin ?? 0,
    })
    if (err) { setPreview(null); return }
    try {
      const r = Calc.calculate({
        costPrice:      v.costPrice,
        shippingCost:   v.shippingCost ?? 0,
        commissionRate: v.commissionRate,
        fixedFee:       v.fixedFee ?? 0,
        taxRate:        v.taxRate ?? 0,
        desiredMargin:  v.desiredMargin,
      })
      setPreview({ price: r.suggestedPrice, profit: r.netProfit, margin: r.netMarginPercent })
    } catch { setPreview(null) }
  }, [watched.platform, watched.costPrice, watched.shippingCost, watched.commissionRate, watched.fixedFee, watched.taxRate, watched.desiredMargin])

  // Preenche campos ao selecionar plataforma
  function onPlatformChange(value: string) {
    const p = platforms.find((p) => p.platform === value)
    if (!p) return
    setValue('commissionRate', p.commissionRate)
    setValue('fixedFee',       p.fixedFee)
    setValue('taxRate',        p.taxRate)
  }

  // Preenche campos ao selecionar produto do histórico
  function onProductSelect(product: ProductOption) {
    setValue('productName', product.name)
    setValue('productSku',  product.sku)
    setValue('costPrice',   Number(product.costPrice) || 0)
  }

  async function onSubmit(data: FormValues) {
    setSaving(true)
    setSaveError(null)
    try {
      const isEdit = Boolean(pricingId)
      const url    = isEdit ? `/api/pricings/${pricingId}` : '/api/pricings/calculate'
      const method = isEdit ? 'PATCH' : 'POST'
      const body   = isEdit
        ? {
            platform:       data.platform,
            costPrice:      data.costPrice,
            shippingCost:   data.shippingCost,
            commissionRate: data.commissionRate,
            fixedFee:       data.fixedFee,
            taxRate:        data.taxRate,
            desiredMargin:  data.desiredMargin,
            notes:          data.notes,
          }
        : data

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setSaveError(typeof json.error === 'string' ? json.error : 'Erro ao salvar.')
        return
      }
      router.push('/dashboard/precificacao')
    } catch {
      setSaveError('Erro de conexão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {saveError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">{saveError}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Coluna esquerda — inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da Precificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Produto — texto livre + busca (read-only em modo edição) */}
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label>Nome do produto</Label>
                  <Input
                    placeholder="Digite o nome do produto"
                    readOnly={Boolean(pricingId)}
                    className={pricingId ? 'bg-muted text-muted-foreground cursor-default' : ''}
                    {...register('productName')}
                  />
                  {errors.productName && (
                    <p className="text-sm text-destructive">{errors.productName.message as string}</p>
                  )}
                </div>
                {!pricingId && <ProductSearchDialog products={products} onSelect={onProductSelect} />}
              </div>

              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input
                  placeholder="Ex: 800CLASS00"
                  readOnly={Boolean(pricingId)}
                  className={pricingId ? 'bg-muted text-muted-foreground cursor-default' : ''}
                  {...register('productSku')}
                />
              </div>
            </div>

            {/* Plataforma */}
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => { if (!v) return; field.onChange(v); onPlatformChange(v) }}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.platform} value={p.platform}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.platform && (
                <p className="text-sm text-destructive">{errors.platform.message as string}</p>
              )}
            </div>

            {/* Campos numéricos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Custo do produto (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00"
                  {...register('costPrice', { valueAsNumber: true })} />
                {errors.costPrice && (
                  <p className="text-sm text-destructive">{errors.costPrice.message as string}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Frete / logística (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00"
                  {...register('shippingCost', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Comissão da plataforma (%)</Label>
                <Input type="number" step="0.1" min="0" max="99" placeholder="0"
                  {...register('commissionRate', { valueAsNumber: true })} />
                {errors.commissionRate && (
                  <p className="text-sm text-destructive">{errors.commissionRate.message as string}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Taxa fixa (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00"
                  {...register('fixedFee', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Impostos (%)</Label>
                <Input type="number" step="0.1" min="0" max="99" placeholder="0"
                  {...register('taxRate', { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Margem desejada (%)</Label>
                <Input type="number" step="0.1" min="5" max="100" placeholder="12,5"
                  {...register('desiredMargin', { valueAsNumber: true })} />
                {errors.desiredMargin && (
                  <p className="text-sm text-destructive">{errors.desiredMargin.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input placeholder="Ex: promoção de fim de ano" {...register('notes')} />
            </div>
          </CardContent>
        </Card>

        {/* Coluna direita — resultado */}
        <Card className={preview ? 'border-2 border-primary shadow-lg' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Resultado</CardTitle>
              {preview && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Preço sugerido</span>
                    <span className="text-2xl font-bold text-primary">{BRL(preview.price)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Lucro líquido</span>
                    <span className="text-lg font-semibold text-green-600">{BRL(preview.profit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Margem real</span>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {preview.margin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  Fórmula: (Custo + Frete + Taxa Fixa) ÷ (1 − Comissão% − Imposto% − Margem%)
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                <div className="text-center">
                  <p className="mb-2">Preencha os campos para ver o resultado</p>
                  <p className="text-xs">→ Selecione uma plataforma para auto-preencher as taxas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button type="submit" disabled={!preview || saving}>
          {saving
            ? (pricingId ? 'Atualizando…' : 'Salvando…')
            : (pricingId ? 'Atualizar Precificação' : 'Salvar Precificação')}
        </Button>
        <Button type="button" variant="outline"
          onClick={() => router.push('/dashboard/precificacao/comparar')}>
          Comparar Plataformas
        </Button>
        <Button type="button" variant="outline"
          onClick={() => router.push('/dashboard/precificacao')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
