import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// UUID fixo para o admin — deve corresponder ao user criado no Supabase Auth
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001'
const ORG_ID = '00000000-0000-0000-0000-000000000010'

async function main() {
  // 1. Organização
  const org = await prisma.organization.upsert({
    where: { slug: 'novera-co' },
    update: {},
    create: {
      id: ORG_ID,
      name: 'Novera Co.',
      slug: 'novera-co',
    },
  })

  // 2. Usuário admin (o ID deve bater com auth.users no Supabase)
  await prisma.user.upsert({
    where: { id: ADMIN_USER_ID },
    update: {},
    create: {
      id: ADMIN_USER_ID,
      organizationId: org.id,
      email: 'gabrielgoncalv78@gmail.com',
      name: 'Gabriel Gonçalves',
      role: UserRole.ADMIN,
    },
  })

  // 3. Configurações de plataforma (5 configs)
  const platforms = [
    {
      platform: 'mercado_livre_classico',
      name: 'Mercado Livre (Clássico)',
      commissionRate: 16.5,
      fixedFee: 1.5,
      taxRate: 0,
      description: 'ML Clássico — frete não incluso',
    },
    {
      platform: 'mercado_livre_premium',
      name: 'Mercado Livre (Premium)',
      commissionRate: 11.5,
      fixedFee: 1.5,
      taxRate: 0,
      description: 'ML Premium — frete grátis ao comprador',
    },
    {
      platform: 'shopee',
      name: 'Shopee',
      commissionRate: 20.0,
      fixedFee: 4.0,
      taxRate: 0,
      description: 'Shopee — seller paga frete',
    },
    {
      platform: 'amazon',
      name: 'Amazon',
      commissionRate: 15.0,
      fixedFee: 2.0,
      taxRate: 0,
      description: 'Amazon — frete não incluso',
    },
    {
      platform: 'site_proprio',
      name: 'Site Próprio',
      commissionRate: 0,
      fixedFee: 0,
      taxRate: 0,
      description: 'www.norecaco.com.br — sem comissão de plataforma',
    },
  ]

  for (const p of platforms) {
    await prisma.platformConfig.upsert({
      where: { organizationId_platform: { organizationId: org.id, platform: p.platform } },
      update: {},
      create: {
        organizationId: org.id,
        ...p,
        commissionRate: p.commissionRate,
        fixedFee: p.fixedFee,
        taxRate: p.taxRate,
      },
    })
  }

  // 4. Produtos (16 produtos reais da planilha)
  const products = [
    { sku: '102ATELIE',     name: 'Jogo de Toalha Completo 5 Pçs — Ateliê',                    costPrice: 0 },
    { sku: '800CLASS00',    name: 'Jogo de Toalha Completo 5 Pçs — Class Branco',               costPrice: 0 },
    { sku: '800NOBLES00',   name: 'Jogo de Toalha Completo 5 Pçs — Noblesse',                   costPrice: 0 },
    { sku: '800PARIS00',    name: 'Jogo de Toalha Completo 5 Pçs — Paris Branco',               costPrice: 0 },
    { sku: '800PREMIUM5',   name: 'Jogo de Toalha Simples 5 Pçs Premium 290g',                  costPrice: 0 },
    { sku: '800ROUPAO00',   name: 'Roupão de Banho Adulto Felpudo 100% Algodão',                 costPrice: 0 },
    { sku: '102CCAPEZINHO', name: 'Kit 5 Pçs Tapete Toalha de Piso Pézinho 400g',               costPrice: 0 },
    { sku: '102CCABLOOM',   name: 'Toalha de Banho Bloom 350g 150x75cm',                        costPrice: 0 },
    { sku: 'CCABEACH00',    name: 'Toalha de Banho para Praia e Piscina Beach',                  costPrice: 0 },
    { sku: '101VED53037',   name: 'Xale para Sofá Manta Grid Jacquard',                         costPrice: 0 },
    { sku: 'VED52321',      name: 'Jogo de Lençol 4 Pçs Casal Padrão Versatile',               costPrice: 0 },
    { sku: '102CCABOSSA',   name: 'Kit 2 Pçs Toalha de Banho Bossa 340g',                      costPrice: 0 },
    { sku: '800LINEA00',    name: 'Kit 2 Pçs Toalha de Banho Linea 260g',                      costPrice: 0 },
    { sku: 'CCABEACH2P00',  name: 'Kit 2 Pçs Toalha de Banho para Praia Beach',                costPrice: 0 },
    { sku: '107SDAREF12',   name: 'Refil para Difusor Classic Aroma Premium 100ml',             costPrice: 0 },
    { sku: '107SDA25',      name: 'Difusor Classic Frasco de Vidro 100ml',                      costPrice: 0 },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { organizationId_sku: { organizationId: org.id, sku: p.sku } },
      update: {},
      create: {
        organizationId: org.id,
        sku: p.sku,
        name: p.name,
        costPrice: p.costPrice,
      },
    })
  }

  console.log(`✅ Seed concluído:`)
  console.log(`   • 1 organização: ${org.name}`)
  console.log(`   • 1 usuário admin`)
  console.log(`   • ${platforms.length} configurações de plataforma`)
  console.log(`   • ${products.length} produtos`)
  console.log(``)
  console.log(`⚠️  Próximo passo: crie o usuário admin no Supabase Auth com o e-mail`)
  console.log(`   gabrielgoncalv78@gmail.com e atualize o ID no banco se necessário.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
