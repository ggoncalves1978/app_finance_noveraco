'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthData {
  month:   string
  revenue: number
  profit:  number
}

interface Props {
  data: MonthData[]
}

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function RevenueChart({ data }: Props) {
  const hasData = data.some(d => d.revenue > 0 || d.profit > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receita × Lucro (últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip formatter={(v: number) => BRL(v)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Receita"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Lucro"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
            Lance pedidos para ver o gráfico de evolução.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
