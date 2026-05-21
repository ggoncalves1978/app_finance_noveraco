'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SeoKpiCards } from '@/components/seo/SeoKpiCards'
import { SeoMetricsChart } from '@/components/seo/SeoMetricsChart'
import { CampaignsTable } from '@/components/seo/CampaignsTable'
import { KeywordsTable } from '@/components/seo/KeywordsTable'
import { CampaignForm } from '@/components/seo/CampaignForm'
import { KeywordForm } from '@/components/seo/KeywordForm'
import { useToast } from '@/lib/use-toast'
import { SeoCampaignStatus } from '@prisma/client'

interface Campaign {
  id: string
  name: string
  platform: string
  type: string
  status: SeoCampaignStatus
  budget: number | null
  spent: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  creator: { name: string | null }
}

interface Keyword {
  id: string
  keyword: string
  platform: string
  searchVolume: number | null
  competition: string | null
  currentPosition: number | null
  targetPosition: number | null
  product?: { sku: string; name: string } | null
}

export default function SeoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [openCampaignForm, setOpenCampaignForm] = useState(false)
  const [openKeywordForm, setOpenKeywordForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [campaignsRes, keywordsRes] = await Promise.all([
        fetch('/api/seo/campaigns?pageSize=100'),
        fetch('/api/seo/keywords?pageSize=100'),
      ])

      if (!campaignsRes.ok || !keywordsRes.ok) throw new Error('Erro ao carregar dados')

      const campaignsData = await campaignsRes.json()
      const keywordsData = await keywordsRes.json()

      setCampaigns(campaignsData.campaigns || [])
      setKeywords(keywordsData.keywords || [])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do SEO',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCampaign = async (data: any) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/seo/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Erro ao criar campanha')

      const result = await res.json()
      setCampaigns([result.campaign, ...campaigns])
      toast({
        title: 'Sucesso',
        description: 'Campanha criada com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar campanha',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/seo/campaigns/${id}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Erro ao excluir campanha')

      setCampaigns(campaigns.filter(c => c.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Campanha excluída com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir campanha',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateKeyword = async (data: any) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Erro ao adicionar palavra-chave')

      const result = await res.json()
      setKeywords([result.keyword, ...keywords])
      toast({
        title: 'Sucesso',
        description: 'Palavra-chave adicionada com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao adicionar palavra-chave',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/seo/keywords/${id}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Erro ao excluir palavra-chave')

      setKeywords(keywords.filter(k => k.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Palavra-chave excluída com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir palavra-chave',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate KPIs
  const activeCampaigns = campaigns.filter(c => c.status === 'ATIVO').length
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0

  // Generate chart data (mock - last 6 months)
  const chartData = [
    { month: 'Jan', impressions: 45000, clicks: 1500, conversions: 120 },
    { month: 'Fev', impressions: 52000, clicks: 1750, conversions: 150 },
    { month: 'Mar', impressions: 48000, clicks: 1600, conversions: 140 },
    { month: 'Abr', impressions: 61000, clicks: 2050, conversions: 180 },
    { month: 'Mai', impressions: 55000, clicks: 1850, conversions: 160 },
    { month: 'Jun', impressions: totalImpressions, clicks: totalClicks, conversions: campaigns.reduce((sum, c) => sum + c.conversions, 0) },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel SEO</h1>
        <p className="text-muted-foreground mt-2">Monitore campanhas e palavras-chave</p>
      </div>

      {/* KPI Cards */}
      <SeoKpiCards
        activeCampaigns={activeCampaigns}
        totalImpressions={totalImpressions}
        totalClicks={totalClicks}
        avgRoas={avgRoas}
      />

      {/* Chart */}
      <SeoMetricsChart data={chartData} />

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
        </TabsList>

        {/* Campanhas Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Button onClick={() => setOpenCampaignForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
          <CampaignsTable
            campaigns={campaigns}
            onEdit={() => {}} // TODO: Implement edit
            onDelete={handleDeleteCampaign}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <Button onClick={() => setOpenKeywordForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Palavra-chave
          </Button>
          <KeywordsTable
            keywords={keywords}
            onEdit={() => {}} // TODO: Implement edit
            onDelete={handleDeleteKeyword}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <CampaignForm
        open={openCampaignForm}
        onOpenChange={setOpenCampaignForm}
        onSubmit={handleCreateCampaign}
        isLoading={isLoading}
      />

      <KeywordForm
        open={openKeywordForm}
        onOpenChange={setOpenKeywordForm}
        onSubmit={handleCreateKeyword}
        isLoading={isLoading}
      />
    </div>
  )
}
