import { OrderStatus } from '@prisma/client'

export interface BlingConfig {
  clientId: string
  clientSecret: string
  // OAuth2 access token — obtained via /api/integrations/bling/auth
  // Stored in DB (encrypted); never exposed to the frontend
  accessToken?: string
  baseUrl: string
}

export interface BlingOrder {
  id: number
  numero: string
  data: string
  situacao: { id: number; valor: string }
  contato: { nome: string }
  transporte?: { volumes?: { cidadeDestinatario?: string; ufDestinatario?: string }[] }
  totalProdutos: number
  totalVenda: number
  desconto: number
  frete: number
  itens: {
    item: {
      codigo: string
      descricao: string
      quantidade: number
      valorunidade: number
      precoCusto: number
    }
  }[]
}

export interface BlingFetchParams {
  dateFrom?: string
  dateTo?: string
  page?: number
}

export interface BlingStatusResult {
  connected: boolean
  message: string
  tokenExpiry?: string
}

/** Reads config from env vars. Throws if any required var is missing. */
export function getBlingConfig(): BlingConfig {
  const clientId     = process.env.BLING_CLIENT_ID
  const clientSecret = process.env.BLING_CLIENT_SECRET
  const baseUrl      = process.env.BLING_BASE_URL ?? 'https://www.bling.com.br/Api/v3'

  if (!clientId || !clientSecret) {
    throw new Error('BLING_CLIENT_ID e BLING_CLIENT_SECRET são obrigatórios')
  }

  return { clientId, clientSecret, baseUrl }
}

/**
 * Exchanges an authorization code for an access + refresh token.
 * Called after the user completes the OAuth2 flow in the UI.
 * TODO: implement — POST {baseUrl}/oauth/token
 */
export async function exchangeBlingCode(
  config: BlingConfig,
  code: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  throw new Error('NOT_IMPLEMENTED')
}

/** Verifies that the stored access token is still valid. */
export async function checkBlingStatus(config: BlingConfig): Promise<BlingStatusResult> {
  // TODO: implement — GET {baseUrl}/usuarios/me
  // Headers: { Authorization: `Bearer ${config.accessToken}` }
  throw new Error('NOT_IMPLEMENTED')
}

/** Fetches orders from Bling for a given date range. */
export async function fetchBlingOrders(
  config: BlingConfig,
  params: BlingFetchParams
): Promise<BlingOrder[]> {
  // TODO: implement — GET {baseUrl}/pedidos/vendas?dataInicial=...&dataFinal=...&pagina=...
  // Headers: { Authorization: `Bearer ${config.accessToken}` }
  throw new Error('NOT_IMPLEMENTED')
}

/** Maps a raw Bling order to the shape expected by POST /api/orders. */
export function mapBlingOrder(raw: BlingOrder): {
  externalId: string
  platform: string
  orderDate: string
  status: OrderStatus
  customerName: string
  grossRevenue: number
  platformFee: number
  shippingCost: number
  productCost: number
  taxes: number
  source: 'BLING'
  items: { sku: string; productName: string; quantity: number; unitPrice: number; unitCost: number }[]
} {
  // Bling situacao IDs: 6=Em aberto, 9=Atendido, 12=Cancelado, etc.
  const statusMap: Record<number, OrderStatus> = {
    6:  'PENDENTE',
    9:  'ENTREGUE',
    12: 'CANCELADO',
    15: 'ENVIADO',
  }

  const productCost = raw.itens.reduce(
    (s, { item: i }) => s + i.precoCusto * i.quantidade,
    0
  )

  return {
    externalId:   String(raw.numero),
    platform:     'bling',
    orderDate:    raw.data,
    status:       statusMap[raw.situacao.id] ?? 'PENDENTE',
    customerName: raw.contato.nome,
    grossRevenue: raw.totalVenda,
    platformFee:  0,
    shippingCost: raw.frete,
    productCost,
    taxes:        0,
    source:       'BLING',
    items:        raw.itens.map(({ item: i }) => ({
      sku:         i.codigo,
      productName: i.descricao,
      quantity:    i.quantidade,
      unitPrice:   i.valorunidade,
      unitCost:    i.precoCusto,
    })),
  }
}
