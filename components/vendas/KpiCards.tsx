import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receita Bruta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{BRL(grossRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {BRL(netProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Margem Média</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Este mês</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{orderCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Este mês</p>
        </CardContent>
      </Card>
    </div>
  )
}
