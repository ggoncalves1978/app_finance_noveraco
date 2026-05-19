import { z } from 'zod'

export const calculateSchema = z.object({
  productName:    z.string().min(1, 'Nome do produto é obrigatório'),
  productSku:     z.string().optional(),
  platform:       z.string().min(1, 'Selecione uma plataforma'),
  costPrice:      z.number().min(0),
  shippingCost:   z.number().min(0).default(0),
  commissionRate: z.number().min(0).max(99),
  fixedFee:       z.number().min(0).default(0),
  taxRate:        z.number().min(0).max(99).default(0),
  desiredMargin:  z.number().min(5).max(100),
  notes:          z.string().optional(),
})

export const updateSchema = z.object({
  platform:       z.string().min(1).optional(),
  costPrice:      z.number().min(0).optional(),
  shippingCost:   z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(99).optional(),
  fixedFee:       z.number().min(0).optional(),
  taxRate:        z.number().min(0).max(99).optional(),
  desiredMargin:  z.number().min(5).max(100).optional(),
  notes:          z.string().optional(),
})

export const compareSchema = z.object({
  costPrice:    z.number().min(0),
  shippingCost: z.number().min(0).default(0),
})

export type CalculateInput = z.infer<typeof calculateSchema>
export type UpdateInput    = z.infer<typeof updateSchema>
export type CompareInput   = z.infer<typeof compareSchema>
