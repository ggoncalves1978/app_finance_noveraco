'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface ProductOption {
  id:        string
  sku:       string
  name:      string
  costPrice: number
}

interface Props {
  products: ProductOption[]
  onSelect: (product: ProductOption) => void
}

export function ProductSearchDialog({ products, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  function handleSelect(product: ProductOption) {
    onSelect(product)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" />}>
        <Search className="h-4 w-4" />
        Buscar produto anterior
      </DialogTrigger>

      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Buscar produto precificado anteriormente</DialogTitle>
        </DialogHeader>

        <Command>
          <CommandInput placeholder="Digite nome ou SKU…" />
          <CommandList className="max-h-72">
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.sku} ${p.name}`}
                  onSelect={() => handleSelect(p)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.sku}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Number(p.costPrice).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
