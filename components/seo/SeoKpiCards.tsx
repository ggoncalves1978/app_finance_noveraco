'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Eye, MousePointer, Zap } from 'lucide-react'

interface Props {
  activeCampaigns: number
  totalImpressions: number
  totalClicks: number
  avgRoas: number
}

export function SeoKpiCards({ activeCampaigns, totalImpressions, totalClicks, avgRoas }: Props) {
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Campanhas Ativas */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campanhas Ativas</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{activeCampaigns}</p>
              <p className="text-xs text-muted-foreground mt-1">No momento</p>
            </div>
            <Zap className="h-6 w-6 text-blue-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* Impressões */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Impressões (Mês)</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {totalImpressions.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Visualizações</p>
            </div>
            <Eye className="h-6 w-6 text-purple-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* Cliques */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliques (Mês)</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {totalClicks.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">CTR: {ctr}%</p>
            </div>
            <MousePointer className="h-6 w-6 text-green-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* ROAS Médio */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ROAS Médio</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{avgRoas.toFixed(2)}x</p>
              <p className="text-xs text-muted-foreground mt-1">Retorno do investimento</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-600 opacity-30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
