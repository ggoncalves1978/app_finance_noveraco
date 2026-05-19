import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, DollarSign, Percent, ShoppingCart } from 'lucide-react'

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface Props {
  grossRevenue: number
  netProfit:    number
  avgMargin:    number
  orderCount:   number
}

export function KpiCards({ grossRevenue, netProfit, avgMargin, orderCount }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Receita Bruta */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{BRL(grossRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* Lucro Líquido */}
      <Card className={`border-green-200 bg-gradient-to-br ${netProfit >= 0 ? 'from-green-50' : 'from-red-50'} to-transparent`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
              <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {BRL(netProfit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <TrendingUp className={`h-6 w-6 opacity-30 ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Margem Média */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{avgMargin.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <Percent className="h-6 w-6 text-purple-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* Total de Pedidos */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{orderCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </div>
            <ShoppingCart className="h-6 w-6 text-orange-600 opacity-30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
