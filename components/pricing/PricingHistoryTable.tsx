'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pencil, Trash2, Copy, Download } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Row {
  id:               string
  createdAt:        string
  productSku:       string
  productName:      string
  platform:         string
  costPrice:        number
  suggestedPrice:   number
  netProfit:        number
  netMarginPercent: number
  createdBy:        string
}

interface Props {
  rows:     Row[]
  total:    number
  page:     number
  pageSize: number
}

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const PLATFORM_LABELS: Record<string, string> = {
  mercado_livre_classico: 'ML Clássico',
  mercado_livre_premium:  'ML Premium',
  shopee:                 'Shopee',
  amazon:                 'Amazon',
  site_proprio:           'Site Próprio',
}

export function PricingHistoryTable({ rows, total, page, pageSize }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const totalPages   = Math.ceil(total / pageSize)

  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting,  setIsDeleting]  = useState(false)
  const [cloningId,   setCloningId]   = useState<string | null>(null)

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/dashboard/precificacao?${params.toString()}`)
  }

  async function handleDelete() {
    if (!deletingId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/pricings/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setDeleteError(typeof json.error === 'string' ? json.error : 'Erro ao excluir.')
        return
      }
      setDeletingId(null)
      router.refresh()
    } catch {
      setDeleteError('Erro de conexão.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleClone(row: Row) {
    setCloningId(row.id)
    try {
      const res = await fetch('/api/pricings/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: row.productName,
          productSku: row.productSku,
          platform: row.platform,
          costPrice: row.costPrice,
          shippingCost: 0,
          commissionRate: 0,
          fixedFee: 0,
          taxRate: 0,
          desiredMargin: row.netMarginPercent,
          notes: `Clonado de ${new Date(row.createdAt).toLocaleDateString('pt-BR')}`,
        }),
      })
      if (res.ok) {
        router.push('/dashboard/precificacao')
        router.refresh()
      }
    } catch {
      // silently fail
    } finally {
      setCloningId(null)
    }
  }

  function handleExportCSV() {
    const headers = ['Data', 'Produto', 'SKU', 'Plataforma', 'Custo', 'Preço Sugerido', 'Lucro', 'Margem %', 'Criado por']
    const csvContent = [
      headers.join(','),
      ...rows.map(r =>
        [
          new Date(r.createdAt).toLocaleDateString('pt-BR'),
          r.productName,
          r.productSku,
          PLATFORM_LABELS[r.platform] ?? r.platform,
          r.costPrice.toString(),
          r.suggestedPrice.toString(),
          r.netProfit.toString(),
          r.netMarginPercent.toFixed(1),
          r.createdBy,
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `precificacoes_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground text-sm">
        <p>Nenhuma precificação encontrada.</p>
        <Link href="/dashboard/precificacao/nova">
          <Button className="mt-4" variant="outline">Criar primeira precificação</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Preço Sugerido</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead>Criado por</TableHead>
                <TableHead className="text-center w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.productName}>
                    {row.productName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.productSku}</Badge>
                  </TableCell>
                  <TableCell>
                    {PLATFORM_LABELS[row.platform] ?? row.platform}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {BRL(row.costPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-primary">
                    {BRL(row.suggestedPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-green-600">
                    {BRL(row.netProfit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{row.netMarginPercent.toFixed(1)}%</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.createdBy}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/dashboard/precificacao/${row.id}/editar`}>
                        <Button variant="ghost" size="icon-sm" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Clonar"
                        disabled={cloningId === row.id}
                        onClick={() => handleClone(row)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Excluir"
                        onClick={() => { setDeletingId(row.id); setDeleteError(null) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) { setDeletingId(null); setDeleteError(null) } }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Excluir precificação?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeletingId(null); setDeleteError(null) }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
