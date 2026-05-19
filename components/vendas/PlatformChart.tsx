'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PlatformData {
  name:    string
  value:   number
  revenue: number
}

interface Props {
  data: PlatformData[]
}

const COLORS  = ['#3b82f6', '#f97316', '#a855f7', '#22c55e', '#eab308']
const BRL     = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function PlatformChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _name: string, props: { payload?: PlatformData }) =>
                  [`${v} pedidos — ${BRL(props.payload?.revenue ?? 0)}`, props.payload?.name]
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
            Lance pedidos para ver a distribuição por plataforma.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
