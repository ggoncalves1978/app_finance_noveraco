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
import { KeywordCompetition } from '@prisma/client'

interface Keyword {
  id: string
  keyword: string
  platform: string
  searchVolume: number | null
  competition: KeywordCompetition | null
  currentPosition: number | null
  targetPosition: number | null
  product?: { sku: string; name: string } | null
}

interface Props {
  keywords: Keyword[]
  onEdit: (keyword: Keyword) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const competitionColors: Record<string, string> = {
  BAIXA: 'bg-green-100 text-green-800',
  MEDIA: 'bg-yellow-100 text-yellow-800',
  ALTA: 'bg-red-100 text-red-800',
}

export function KeywordsTable({ keywords, onEdit, onDelete, isLoading }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    await onDelete(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Palavras-chave ({keywords.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Palavra-chave</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Volume Busca</TableHead>
                <TableHead>Concorrência</TableHead>
                <TableHead className="text-right">Posição Atual</TableHead>
                <TableHead className="text-right">Posição Meta</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((keyword) => (
                <TableRow key={keyword.id}>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell>{keyword.platform}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {keyword.product ? `${keyword.product.sku}` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {keyword.searchVolume ? keyword.searchVolume.toLocaleString('pt-BR') : '—'}
                  </TableCell>
                  <TableCell>
                    {keyword.competition ? (
                      <Badge className={competitionColors[keyword.competition]}>
                        {keyword.competition === 'ALTA' ? 'Alta' : keyword.competition === 'MEDIA' ? 'Média' : 'Baixa'}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {keyword.currentPosition ? `#${keyword.currentPosition}` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {keyword.targetPosition ? `#${keyword.targetPosition}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(keyword)}
                        disabled={isLoading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(keyword.id)}
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
              Tem certeza que deseja excluir esta palavra-chave? Esta ação não pode ser desfeita.
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
