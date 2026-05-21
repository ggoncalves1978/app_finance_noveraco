'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2 } from 'lucide-react'
import { SeoCampaignStatus } from '@prisma/client'

interface Campaign {
  id: string
  name: string
  platform: string
  type: string
  status: SeoCampaignStatus
  budget: number | null
  spent: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  creator: { name: string | null }
}

interface Props {
  campaigns: Campaign[]
  onEdit: (campaign: Campaign) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const statusColors: Record<SeoCampaignStatus, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  PAUSADO: 'bg-yellow-100 text-yellow-800',
  ENCERRADO: 'bg-gray-100 text-gray-800',
}

const typeLabels: Record<string, string> = {
  SEO_ORGANICO: 'SEO Orgânico',
  PRODUTO_PATROCINADO: 'Produto Patrocinado',
  ADS: 'Anúncios',
}

export function CampaignsTable({ campaigns, onEdit, onDelete, isLoading }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    await onDelete(deleteId)
    setDeleteId(null)
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatNumber = (value: number) => value.toLocaleString('pt-BR')

  const ctr = campaigns.reduce((sum, c) => sum + (c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0), 0) / campaigns.length || 0
  const avgRoas = campaigns.reduce((sum, c) => sum + (c.spent > 0 ? c.revenue / c.spent : 0), 0) / campaigns.length || 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Campanhas ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Orçamento</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Impressões</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">Conversões</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.platform}</TableCell>
                  <TableCell>{typeLabels[campaign.type] || campaign.type}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.budget ? formatCurrency(campaign.budget) : '—'}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(campaign.spent)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatNumber(campaign.conversions)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(campaign.revenue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(campaign)}
                        disabled={isLoading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(campaign.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
