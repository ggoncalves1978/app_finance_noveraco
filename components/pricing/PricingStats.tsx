import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, DollarSign, Percent, Box } from 'lucide-react'

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  totalPricings: number
  avgProfit: number
  avgMargin: number
  totalProfit: number
}

export function PricingStats({ totalPricings, avgProfit, avgMargin, totalProfit }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Precificações</p>
              <p className="text-2xl font-bold mt-2">{totalPricings}</p>
            </div>
            <Box className="h-5 w-5 text-muted-foreground opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lucro Médio</p>
              <p className="text-2xl font-bold mt-2 text-green-600">{BRL(avgProfit)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-green-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
              <p className="text-2xl font-bold mt-2 text-blue-600">{avgMargin.toFixed(1)}%</p>
            </div>
            <Percent className="h-5 w-5 text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lucro Total</p>
              <p className="text-2xl font-bold mt-2 text-primary">{BRL(totalProfit)}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
