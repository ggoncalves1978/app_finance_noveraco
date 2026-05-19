import { z } from 'zod'

export const orderItemSchema = z.object({
  productId:   z.string().uuid().optional(),
  sku:         z.string().optional(),
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  quantity:    z.number().int().min(1, 'Quantidade mínima é 1'),
  unitPrice:   z.number().min(0),
  unitCost:    z.number().min(0).default(0),
})

export const createOrderSchema = z.object({
  platform:      z.string().min(1, 'Selecione uma plataforma'),
  orderDate:     z.string().min(1, 'Data é obrigatória'),
  externalId:    z.string().optional(),
  status:        z.enum(['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO']).default('PENDENTE'),
  customerName:  z.string().optional(),
  customerCity:  z.string().optional(),
  customerState: z.string().optional(),
  platformFee:   z.number().min(0).default(0),
  shippingCost:  z.number().min(0).default(0),
  productCost:   z.number().min(0).default(0),
  taxes:         z.number().min(0).default(0),
  notes:         z.string().optional(),
  items:         z.array(orderItemSchema).min(1, 'Adicione pelo menos 1 item'),
})

export const updateOrderSchema = z.object({
  status:        z.enum(['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO']).optional(),
  customerName:  z.string().optional(),
  customerCity:  z.string().optional(),
  customerState: z.string().optional(),
  platformFee:   z.number().min(0).optional(),
  shippingCost:  z.number().min(0).optional(),
  productCost:   z.number().min(0).optional(),
  taxes:         z.number().min(0).optional(),
  notes:         z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
