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
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  creator: { name: string | null }
}

interface Keyword {
  id: string
  keyword: string
  platform: string
  searchVolume: number | null
  competition: 'BAIXA' | 'MEDIA' | 'ALTA' | null
  currentPosition: number | null
  targetPosition: number | null
  notes?: string | null
  product?: { sku: string; name: string } | null
}

export default function SeoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [chartData, setChartData] = useState<{ month: string; impressions: number; clicks: number; conversions: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [openCampaignForm, setOpenCampaignForm] = useState(false)
  const [openKeywordForm, setOpenKeywordForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [campaignsRes, keywordsRes, metricsRes] = await Promise.all([
        fetch('/api/seo/campaigns?pageSize=100'),
        fetch('/api/seo/keywords?pageSize=100'),
        fetch('/api/seo/metrics'),
      ])

      if (!campaignsRes.ok || !keywordsRes.ok || !metricsRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const [campaignsData, keywordsData, metricsData] = await Promise.all([
        campaignsRes.json(),
        keywordsRes.json(),
        metricsRes.json(),
      ])

      setCampaigns(campaignsData.campaigns || [])
      setKeywords(keywordsData.keywords || [])
      setChartData(metricsData.data || [])
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do SEO',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCampaign = async (data: any) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/seo/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar campanha')
      const result = await res.json()
      setCampaigns(prev => [result.campaign, ...prev])
      toast({ title: 'Sucesso', description: 'Campanha criada com sucesso' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar campanha',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCampaign = async (data: any) => {
    if (!editingCampaign) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seo/campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar campanha')
      const result = await res.json()
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...result.campaign } : c))
      toast({ title: 'Sucesso', description: 'Campanha atualizada com sucesso' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar campanha',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seo/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir campanha')
      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast({ title: 'Sucesso', description: 'Campanha excluída com sucesso' })
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
    setIsLoading(true)
    try {
      const res = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao adicionar palavra-chave')
      const result = await res.json()
      setKeywords(prev => [result.keyword, ...prev])
      toast({ title: 'Sucesso', description: 'Palavra-chave adicionada com sucesso' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao adicionar palavra-chave',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateKeyword = async (data: any) => {
    if (!editingKeyword) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seo/keywords/${editingKeyword.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar palavra-chave')
      const result = await res.json()
      setKeywords(prev => prev.map(k => k.id === editingKeyword.id ? { ...k, ...result.keyword } : k))
      toast({ title: 'Sucesso', description: 'Palavra-chave atualizada com sucesso' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar palavra-chave',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seo/keywords/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir palavra-chave')
      setKeywords(prev => prev.filter(k => k.id !== id))
      toast({ title: 'Sucesso', description: 'Palavra-chave excluída com sucesso' })
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

  const activeCampaigns = campaigns.filter(c => c.status === 'ATIVO').length
  const totalImpressions = campaigns.reduce((sum, c) => sum + Number(c.impressions), 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + Number(c.clicks), 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + Number(c.revenue), 0)
  const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel SEO</h1>
        <p className="text-muted-foreground mt-2">Monitore campanhas e palavras-chave</p>
      </div>

      <SeoKpiCards
        activeCampaigns={activeCampaigns}
        totalImpressions={totalImpressions}
        totalClicks={totalClicks}
        avgRoas={avgRoas}
      />

      <SeoMetricsChart data={chartData} />

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Button onClick={() => { setEditingCampaign(null); setOpenCampaignForm(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
          <CampaignsTable
            campaigns={campaigns}
            onEdit={(campaign) => { setEditingCampaign(campaign); setOpenCampaignForm(true) }}
            onDelete={handleDeleteCampaign}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Button onClick={() => { setEditingKeyword(null); setOpenKeywordForm(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Palavra-chave
          </Button>
          <KeywordsTable
            keywords={keywords}
            onEdit={(keyword) => { setEditingKeyword(keyword); setOpenKeywordForm(true) }}
            onDelete={handleDeleteKeyword}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <CampaignForm
        open={openCampaignForm}
        onOpenChange={(open) => { setOpenCampaignForm(open); if (!open) setEditingCampaign(null) }}
        onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
        campaign={editingCampaign}
        isLoading={isLoading}
      />

      <KeywordForm
        open={openKeywordForm}
        onOpenChange={(open) => { setOpenKeywordForm(open); if (!open) setEditingKeyword(null) }}
        onSubmit={editingKeyword ? handleUpdateKeyword : handleCreateKeyword}
        keyword={editingKeyword}
        isLoading={isLoading}
      />
    </div>
  )
}
