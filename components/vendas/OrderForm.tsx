'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { createOrderSchema } from '@/lib/validations/order-schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Platform {
  platform:       string
  name:           string
  commissionRate: number
  fixedFee:       number
}

interface Props {
  platforms: Platform[]
}

type ItemField = {
  productName: string
  sku:         string
  quantity:    number
  unitPrice:   number
  unitCost:    number
}

type FormValues = {
  platform:      string
  orderDate:     string
  externalId:    string
  status:        'PENDENTE' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO' | 'DEVOLVIDO'
  customerName:  string
  customerCity:  string
  customerState: string
  platformFee:   number
  shippingCost:  number
  productCost:   number
  taxes:         number
  notes:         string
  items:         ItemField[]
}

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_OPTIONS = [
  { value: 'PENDENTE',  label: 'Pendente'  },
  { value: 'PAGO',      label: 'Pago'      },
  { value: 'ENVIADO',   label: 'Enviado'   },
  { value: 'ENTREGUE',  label: 'Entregue'  },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'DEVOLVIDO', label: 'Devolvido' },
]

const today = new Date().toISOString().split('T')[0]

export function OrderForm({ platforms }: Props) {
  const router = useRouter()
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    grossRevenue: number; totalCost: number; netProfit: number; netMargin: number
  } | null>(null)

  const {
    register, control, watch, setValue, handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createOrderSchema) as never,
    defaultValues: {
      platform:      '',
      orderDate:     today,
      externalId:    '',
      status:        'PENDENTE',
      customerName:  '',
      customerCity:  '',
      customerState: '',
      platformFee:   0,
      shippingCost:  0,
      productCost:   0,
      taxes:         0,
      notes:         '',
      items:         [{ productName: '', sku: '', quantity: 1, unitPrice: 0, unitCost: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watched = watch()

  useEffect(() => {
    const items = watched.items ?? []
    const grossRevenue = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0)
    const totalCost    = (watched.platformFee || 0) + (watched.shippingCost || 0)
                       + (watched.productCost || 0) + (watched.taxes || 0)
    const netProfit    = grossRevenue - totalCost
    const netMargin    = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0
    setPreview({ grossRevenue, totalCost, netProfit, netMargin })
  }, [
    watched.items, watched.platformFee, watched.shippingCost,
    watched.productCost, watched.taxes,
  ])

  async function onSubmit(data: FormValues) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setSaveError(typeof json.error === 'string' ? json.error : 'Erro ao salvar.')
        return
      }
      router.push('/dashboard/vendas')
      router.refresh()
    } catch {
      setSaveError('Erro de conexão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Coluna esquerda */}
        <div className="space-y-6">

          {/* Dados gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Plataforma</Label>
                  <Controller
                    name="platform"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={v => { if (!v) return; field.onChange(v) }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map(p => (
                            <SelectItem key={p.platform} value={p.platform}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.platform && (
                    <p className="text-sm text-destructive">{errors.platform.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Data do Pedido</Label>
                  <Input type="date" {...register('orderDate')} />
                  {errors.orderDate && (
                    <p className="text-sm text-destructive">{errors.orderDate.message as string}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ID Externo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input placeholder="Ex: 123456789" {...register('externalId')} />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Produto</Label>
                    <Input
                      placeholder="Nome do produto"
                      {...register(`items.${index}.productName`)}
                    />
                    {errors.items?.[index]?.productName && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.productName?.message as string}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label>SKU <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                      <Input placeholder="Ex: 800CLASS00" {...register(`items.${index}.sku`)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Qtd</Label>
                      <Input
                        type="number" min="1" step="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Preço unit. (R$)</Label>
                      <Input
                        type="number" step="0.01" min="0" placeholder="0,00"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Custo unit. (R$)</Label>
                      <Input
                        type="number" step="0.01" min="0" placeholder="0,00"
                        {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.items?.root && (
                <p className="text-sm text-destructive">{errors.items.root.message as string}</p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => append({ productName: '', sku: '', quantity: 1, unitPrice: 0, unitCost: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custos e Taxas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Taxa da plataforma (R$)</Label>
                  <Input
                    type="number" step="0.01" min="0" placeholder="0,00"
                    {...register('platformFee', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Frete (R$)</Label>
                  <Input
                    type="number" step="0.01" min="0" placeholder="0,00"
                    {...register('shippingCost', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Custo do produto (R$)</Label>
                  <Input
                    type="number" step="0.01" min="0" placeholder="0,00"
                    {...register('productCost', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Impostos (R$)</Label>
                  <Input
                    type="number" step="0.01" min="0" placeholder="0,00"
                    {...register('taxes', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Cliente <span className="text-muted-foreground text-sm font-normal">(opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nome</Label>
                  <Input placeholder="Nome do cliente" {...register('customerName')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input placeholder="São Paulo" {...register('customerCity')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Input placeholder="SP" maxLength={2} {...register('customerState')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <Label>Observações <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input placeholder="Ex: pedido recorrente, desconto aplicado" {...register('notes')} />
          </div>
        </div>

        {/* Coluna direita — preview */}
        <div>
          <Card className={preview && preview.netProfit >= 0 ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-base">Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              {preview && preview.grossRevenue > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Receita bruta</span>
                    <span className="text-2xl font-bold text-primary">{BRL(preview.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total de custos</span>
                    <span className="text-lg font-semibold text-destructive">{BRL(preview.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Lucro líquido</span>
                    <span className={`text-lg font-semibold ${preview.netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {BRL(preview.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Margem</span>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {preview.netMargin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground text-center">
                  Adicione itens ao pedido para ver o resultado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar Pedido'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/vendas')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
