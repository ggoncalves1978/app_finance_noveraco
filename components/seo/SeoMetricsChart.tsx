'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  month: string
  impressions: number
  clicks: number
  conversions: number
}

interface Props {
  data: ChartData[]
}

export function SeoMetricsChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas SEO — Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString('pt-BR')} />
            <Legend />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              name="Impressões"
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Cliques"
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Conversões"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
