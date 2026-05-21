'use client'

import { useState } from 'react'
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
  targetPosition: z.string().optional(),
  notes: z.string().optional(),
})

type KeywordForm = z.infer<typeof keywordSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: KeywordForm) => Promise<void>
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

export function KeywordForm({ open, onOpenChange, onSubmit, isLoading }: Props) {
  const [error, setError] = useState<string>('')

  const form = useForm<KeywordForm>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      keyword: '',
      platform: '',
      searchVolume: '',
      competition: undefined,
      targetPosition: '',
      notes: '',
    },
  })

  const handleSubmit = async (data: KeywordForm) => {
    try {
      setError('')
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar palavra-chave')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Palavra-chave</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

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
                    <Input
                      type="number"
                      placeholder="Ex: 1500"
                      {...field}
                    />
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
                  <Select value={field.value} onValueChange={field.onChange}>
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

            <FormField
              control={form.control}
              name="targetPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posição Meta</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações..."
                      className="resize-none"
                      {...field}
                    />
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
                Adicionar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
