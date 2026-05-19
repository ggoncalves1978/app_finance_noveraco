'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, RefreshCw, Search } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface OrderRow {
  id:           string
  orderDate:    string
  externalId:   string | null
  platform:     string
  status:       string
  customerName: string | null
  grossRevenue: number
  netProfit:    number
  netMargin:    number
  createdBy:    string
  items:        { productName: string; quantity: number }[]
}

interface Props {
  initialOrders: OrderRow[]
  initialTotal:  number
}

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const PLATFORM_LABELS: Record<string, string> = {
  mercado_livre_classico: 'ML Clássico',
  mercado_livre_premium:  'ML Premium',
  shopee:                 'Shopee',
  amazon:                 'Amazon',
  site_proprio:           'Site Próprio',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDENTE:  { label: 'Pendente',  className: 'bg-amber-100  text-amber-800  border-amber-200'  },
  PAGO:      { label: 'Pago',      className: 'bg-blue-100   text-blue-800   border-blue-200'   },
  ENVIADO:   { label: 'Enviado',   className: 'bg-purple-100 text-purple-800 border-purple-200' },
  ENTREGUE:  { label: 'Entregue',  className: 'bg-green-100  text-green-800  border-green-200'  },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-100    text-red-800    border-red-200'    },
  DEVOLVIDO: { label: 'Devolvido', className: 'bg-orange-100 text-orange-800 border-orange-200' },
}

const STATUS_OPTIONS = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO']

export function OrdersTable({ initialOrders, initialTotal }: Props) {
  const router = useRouter()

  const [orders,   setOrders]   = useState<OrderRow[]>(initialOrders)
  const [total,    setTotal]    = useState(initialTotal)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)

  const [platform,  setPlatform]  = useState('')
  const [status,    setStatus]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [search,    setSearch]    = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting,  setIsDeleting]  = useState(false)

  const [statusEditId,  setStatusEditId]  = useState<string | null>(null)
  const [newStatus,     setNewStatus]     = useState('')
  const [isUpdating,    setIsUpdating]    = useState(false)
  const [statusError,   setStatusError]   = useState<string | null>(null)

  const pageSize = 25

  const fetchOrders = useCallback(async (params: {
    page: number; platform: string; status: string
    dateFrom: string; dateTo: string; search: string
  }) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(params.page), pageSize: String(pageSize) })
      if (params.platform) qs.set('platform', params.platform)
      if (params.status)   qs.set('status',   params.status)
      if (params.dateFrom) qs.set('dateFrom',  params.dateFrom)
      if (params.dateTo)   qs.set('dateTo',    params.dateTo)
      if (params.search)   qs.set('search',    params.search)

      const res  = await fetch(`/api/orders?${qs}`)
      const json = await res.json() as { orders: OrderRow[]; total: number }
      setOrders(json.orders.map(o => ({
        ...o,
        grossRevenue: Number(o.grossRevenue),
        netProfit:    Number(o.netProfit),
        netMargin:    Number(o.netMargin),
      })))
      setTotal(json.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (page === 1 && !platform && !status && !dateFrom && !dateTo && !search) return
    fetchOrders({ page, platform, status, dateFrom, dateTo, search })
  }, [page, platform, status, dateFrom, dateTo, search, fetchOrders])

  function applySearch() {
    setSearch(searchInput)
    setPage(1)
  }

  async function handleDelete() {
    if (!deletingId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/orders/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setDeleteError(typeof json.error === 'string' ? json.error : 'Erro ao excluir.')
        return
      }
      setDeletingId(null)
      fetchOrders({ page, platform, status, dateFrom, dateTo, search })
      router.refresh()
    } catch {
      setDeleteError('Erro de conexão.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleStatusUpdate() {
    if (!statusEditId || !newStatus) return
    setIsUpdating(true)
    setStatusError(null)
    try {
      const res = await fetch(`/api/orders/${statusEditId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: unknown }
        setStatusError(typeof json.error === 'string' ? json.error : 'Erro ao atualizar.')
        return
      }
      setStatusEditId(null)
      fetchOrders({ page, platform, status, dateFrom, dateTo, search })
      router.refresh()
    } catch {
      setStatusError('Erro de conexão.')
    } finally {
      setIsUpdating(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex gap-1">
          <Input
            placeholder="Buscar pedido, cliente…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applySearch()}
            className="w-56"
          />
          <Button variant="outline" size="icon" onClick={applySearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={platform || 'all'} onValueChange={v => { setPlatform(v === 'all' ? '' : (v ?? '')); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : (v ?? '')); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="w-36 text-sm"
          />
          <span className="text-muted-foreground text-xs">até</span>
          <Input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="w-36 text-sm"
          />
        </div>

        {(platform || status || dateFrom || dateTo || search) && (
          <Button variant="ghost" size="sm" onClick={() => {
            setPlatform(''); setStatus(''); setDateFrom(''); setDateTo('')
            setSearch(''); setSearchInput(''); setPage(1)
          }}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        {loading && (
          <div className="text-center py-3 text-sm text-muted-foreground">Carregando…</div>
        )}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Nenhum pedido encontrado.
          </div>
        )}
        {!loading && orders.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(row => {
                const sc = STATUS_CONFIG[row.status]
                return (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(row.orderDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.externalId ?? <span className="italic">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {PLATFORM_LABELS[row.platform] ?? row.platform}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <span className="text-sm truncate block" title={row.items.map(i => i.productName).join(', ')}>
                        {row.items.length > 0
                          ? row.items[0].productName + (row.items.length > 1 ? ` +${row.items.length - 1}` : '')
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.customerName ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {BRL(row.grossRevenue)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums ${row.netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {BRL(row.netProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{row.netMargin.toFixed(1)}%</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${sc?.className ?? ''}`}
                        onClick={() => { setStatusEditId(row.id); setNewStatus(row.status); setStatusError(null) }}
                        title="Clique para alterar status"
                      >
                        {sc?.label ?? row.status}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
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
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} pedido{total !== 1 ? 's' : ''} — Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Dialog: Alterar Status */}
      <Dialog
        open={statusEditId !== null}
        onOpenChange={open => { if (!open) { setStatusEditId(null); setStatusError(null) } }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Alterar status do pedido</DialogTitle>
            <DialogDescription>Selecione o novo status para este pedido.</DialogDescription>
          </DialogHeader>
          <Select value={newStatus} onValueChange={v => { if (v !== null) setNewStatus(v) }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusError && <p className="text-sm text-destructive">{statusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusEditId(null)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating || !newStatus}>
              {isUpdating ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={open => { if (!open) { setDeletingId(null); setDeleteError(null) } }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Excluir pedido?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O pedido e seus itens serão removidos permanentemente.
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
