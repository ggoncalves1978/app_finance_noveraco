export interface PricingInput {
  costPrice: number
  shippingCost: number
  commissionRate: number  // percentual, ex: 16.5
  fixedFee: number
  taxRate: number         // percentual, ex: 0
  desiredMargin: number   // percentual, ex: 12.5
}

export interface PricingResult {
  suggestedPrice: number
  netProfit: number
  netMarginPercent: number
}

export class PricingCalculator {
  // Preço = (Custo + Frete + Taxa Fixa) / (1 - Comissão% - Imposto% - Margem%)
  static calculate(input: PricingInput): PricingResult {
    const { costPrice, shippingCost, commissionRate, fixedFee, taxRate, desiredMargin } = input

    const divisor =
      1 - commissionRate / 100 - taxRate / 100 - desiredMargin / 100

    if (divisor <= 0) {
      throw new Error(
        'Combinação de comissão, imposto e margem inválida (soma ≥ 100%).'
      )
    }

    const suggestedPrice = (costPrice + shippingCost + fixedFee) / divisor
    const netProfit = suggestedPrice * (desiredMargin / 100)
    const netMarginPercent = (netProfit / suggestedPrice) * 100

    return {
      suggestedPrice: round2(suggestedPrice),
      netProfit: round2(netProfit),
      netMarginPercent: round2(netMarginPercent),
    }
  }

  static validate(input: PricingInput): string | null {
    if (input.costPrice < 0) return 'Custo não pode ser negativo.'
    if (input.desiredMargin < 5 || input.desiredMargin > 100)
      return 'Margem deve estar entre 5% e 100%.'
    if (input.commissionRate < 0 || input.commissionRate >= 100)
      return 'Comissão inválida.'
    const sum = input.commissionRate + input.taxRate + input.desiredMargin
    if (sum >= 100)
      return `Soma de comissão + imposto + margem (${sum}%) não pode atingir 100%.`
    return null
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
