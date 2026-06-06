'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

const keywordSchema = z.object({
  keyword: z.string().min(2, 'Palavra-chave deve ter pelo menos 2 caracteres'),
  platform: z.string().min(1, 'Selecione uma plataforma'),
  searchVolume: z.string().optional(),
  competition: z.enum(['BAIXA', 'MEDIA', 'ALTA']).optional(),
  currentPosition: z.string().optional(),
  targetPosition: z.string().optional(),
  notes: z.string().optional(),
})

type KeywordFormData = z.infer<typeof keywordSchema>

interface KeywordData {
  id: string
  keyword: string
  platform: string
  searchVolume: number | null
  competition: 'BAIXA' | 'MEDIA' | 'ALTA' | null
  currentPosition: number | null
  targetPosition: number | null
  notes?: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: KeywordFormData) => Promise<void>
  keyword?: KeywordData | null
  isLoading?: boolean
}

const platforms = [
  { value: 'mercado-livre', label: 'Mercado Livre' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'site-proprio', label: 'Site Próprio' },
]

const competitions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
]

export function KeywordForm({ open, onOpenChange, onSubmit, keyword, isLoading }: Props) {
  const isEditing = !!keyword

  const form = useForm<KeywordFormData>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      keyword: '',
      platform: '',
      searchVolume: '',
      competition: undefined,
      currentPosition: '',
      targetPosition: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        keyword
          ? {
              keyword: keyword.keyword,
              platform: keyword.platform,
              searchVolume: keyword.searchVolume != null ? String(keyword.searchVolume) : '',
              competition: keyword.competition ?? undefined,
              currentPosition: keyword.currentPosition != null ? String(keyword.currentPosition) : '',
              targetPosition: keyword.targetPosition != null ? String(keyword.targetPosition) : '',
              notes: keyword.notes ?? '',
            }
          : {
              keyword: '',
              platform: '',
              searchVolume: '',
              competition: undefined,
              currentPosition: '',
              targetPosition: '',
              notes: '',
            }
      )
    }
  }, [open, keyword])

  const handleSubmit = async (data: KeywordFormData) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Palavra-chave' : 'Nova Palavra-chave'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palavra-chave</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: toalha de praia 100% algodão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plataforma</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="searchVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Busca Mensal</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concorrência</FormLabel>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {competitions.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {isEditing && (
                <FormField
                  control={form.control}
                  name="currentPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posição Atual</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="targetPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição Meta</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar alterações' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
