import { OrderStatus } from '@prisma/client'

export interface Selle7Config {
  apiKey: string
  storeId: string
  baseUrl: string
}

export interface Selle7Order {
  id: string
  externalId: string
  status: string
  customerName: string
  customerCity?: string
  customerState?: string
  orderDate: string
  grossRevenue: number
  platformFee: number
  shippingCost: number
  items: {
    sku: string
    name: string
    quantity: number
    unitPrice: number
    unitCost: number
  }[]
}

export interface Selle7FetchParams {
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface Selle7StatusResult {
  connected: boolean
  storeId: string
  storeName?: string
  message: string
}

/** Reads config from env vars. Throws if any required var is missing. */
export function getSelle7Config(): Selle7Config {
  const apiKey  = process.env.SELLE7_API_KEY
  const storeId = process.env.SELLE7_STORE_ID
  const baseUrl = process.env.SELLE7_BASE_URL ?? 'https://api.selle7.com.br/v1'

  if (!apiKey || !storeId) {
    throw new Error('SELLE7_API_KEY e SELLE7_STORE_ID são obrigatórios')
  }

  return { apiKey, storeId, baseUrl }
}

/** Verifies connectivity with the Selle7 API. */
export async function checkSelle7Status(config: Selle7Config): Promise<Selle7StatusResult> {
  // TODO: implement — GET {baseUrl}/stores/{storeId}
  // Headers: { Authorization: `Bearer ${config.apiKey}` }
  throw new Error('NOT_IMPLEMENTED')
}

/** Fetches orders from Selle7 matching the given filters. */
export async function fetchSelle7Orders(
  config: Selle7Config,
  params: Selle7FetchParams
): Promise<Selle7Order[]> {
  // TODO: implement — GET {baseUrl}/orders?storeId={storeId}&status=...&dateFrom=...&dateTo=...
  // Headers: { Authorization: `Bearer ${config.apiKey}` }
  throw new Error('NOT_IMPLEMENTED')
}

/** Maps a raw Selle7 order to the shape expected by POST /api/orders. */
export function mapSelle7Order(raw: Selle7Order): {
  externalId: string
  platform: string
  orderDate: string
  status: OrderStatus
  customerName: string
  customerCity?: string
  customerState?: string
  grossRevenue: number
  platformFee: number
  shippingCost: number
  productCost: number
  taxes: number
  source: 'SELLE7'
  items: { sku: string; productName: string; quantity: number; unitPrice: number; unitCost: number }[]
} {
  // TODO: map real Selle7 status values to our OrderStatus enum
  const statusMap: Record<string, OrderStatus> = {
    pending:   'PENDENTE',
    paid:      'PAGO',
    shipped:   'ENVIADO',
    delivered: 'ENTREGUE',
    cancelled: 'CANCELADO',
  }

  return {
    externalId:    raw.externalId,
    platform:      'selle7',
    orderDate:     raw.orderDate,
    status:        statusMap[raw.status] ?? 'PENDENTE',
    customerName:  raw.customerName,
    customerCity:  raw.customerCity,
    customerState: raw.customerState,
    grossRevenue:  raw.grossRevenue,
    platformFee:   raw.platformFee,
    shippingCost:  raw.shippingCost,
    productCost:   raw.items.reduce((s, i) => s + i.unitCost * i.quantity, 0),
    taxes:         0,
    source:        'SELLE7',
    items:         raw.items.map(i => ({
      sku:         i.sku,
      productName: i.name,
      quantity:    i.quantity,
      unitPrice:   i.unitPrice,
      unitCost:    i.unitCost,
    })),
  }
}
