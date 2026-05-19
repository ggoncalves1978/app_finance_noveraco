# 📚 Skills Novera Co. MVP — Guia de Uso

## 📁 Estrutura Gerada

```
skills/
├── database-schema-novera/
│   └── SKILL.md
│       ├─ Schemas SQL completos (10 tabelas)
│       ├─ RLS (Row Level Security) policies
│       ├─ Seed data (16 produtos reais)
│       ├─ Prisma schema.prisma (alternativa)
│       └─ Índices otimizados
│
├── seguranca-autenticacao-novera/
│   └── SKILL.md
│       ├─ Setup Supabase Auth
│       ├─ JWT + token management
│       ├─ Middleware de autenticação
│       ├─ Autorização por roles (admin/operador/visualizador)
│       ├─ Headers de segurança
│       ├─ Rate limiting
│       ├─ Audit logging
│       └─ Proteção contra vulnerabilidades
│
└── modulo-precificacao-builder/
    └── SKILL.md
        ├─ Fórmula de precificação com exemplos
        ├─ PricingCalculator class (lógica)
        ├─ Schemas Zod (validação)
        ├─ API routes (/calculate, /compare)
        ├─ Componentes React (Calculator, Comparator)
        ├─ Testes unitários
        ├─ Query SQL para relatórios
        └─ Warnings/validações de negócio
```

---

## 🚀 Como Usar as Skills

### Opção 1: Como Referência (Mais Rápido)
Você lê cada skill e copia/adapta o código conforme precisa.

```bash
# Passo 1: Ler a skill
cat skills/database-schema-novera/SKILL.md

# Passo 2: Implementar no seu projeto
# Copiar schemas SQL e executar no Supabase
# Ou usar Prisma migration
```

### Opção 2: Com Claude (Recomendado)
Você usa as skills como contexto para Claude gerar mais código.

```
Você: "Usando a skill 'modulo-precificacao-builder', 
       gere os arquivos:
       1. /app/dashboard/precificacao/page.tsx
       2. /components/pricing/PricingHistoryTable.tsx
       3. Adicione exportação CSV"

Claude (com skill): Gera código baseado nas specs da skill
```

### Opção 3: Setup Automático
Se usar Prisma, é mais fácil:

```bash
# 1. Copiar schema Prisma da skill
cp skills/database-schema-novera/prisma.schema ./prisma/schema.prisma

# 2. Rodar migração
npx prisma migrate dev --name init

# 3. Seed automático
npx prisma db seed

# Banco já está pronto!
```

---

## 📖 Roadmap de Implementação (Ordem Recomendada)

### Semana 1: Fundação

**Dia 1-2: Database**
- Usar skill `database-schema-novera`
- Setup Supabase (criar tabelas)
- Ativar RLS
- Executar seed data (16 produtos)

```bash
# Comandos
npx prisma migrate dev --name init
npx prisma db seed
```

**Dia 3-4: Autenticação**
- Usar skill `seguranca-autenticacao-novera`
- Setup Supabase Auth
- Criar tela de Login
- Middleware protegendo rotas

**Dia 5: Layouts**
- Criar Sidebar + Header
- Setup shadcn/ui
- Estrutura básica do dashboard

### Semana 2: Precificação

**Dia 6-7: Calculadora**
- Usar skill `modulo-precificacao-builder`
- Implementar PricingCalculator class
- Criar `/app/dashboard/precificacao/nova/page.tsx`
- Componente PricingCalculator

**Dia 8-9: Histórico e Comparador**
- Tabela de histórico (filtros + paginação)
- Comparador de plataformas
- API endpoints de precificação

**Dia 10: Testes**
- Testar fórmula com planilha original
- Validar warnings
- Exportação CSV

### Semana 3: Vendas + SEO

**Dia 11-14: Dashboard de Vendas**
- CRUD de pedidos
- KPIs e gráficos
- Preparar integração Selle7/Bling (stubs)

**Dia 15-16: SEO**
- Painel de campanhas
- Tracker de keywords
- Análise de conteúdo (preparar para IA)

### Semana 4: Polish + Deploy

**Dia 17-19: Refinamento**
- Testes de segurança
- Performance otimizada
- Responsivo (mobile)

**Dia 20: Deploy**
- Setup domínio app.norecaco.com.br
- HTTPS obrigatório
- Monitoramento

---

## 🎯 Como Chamar Claude Usando as Skills

### Exemplo 1: "Crie a tela de login usando a skill"
```
Você: "Usando a skill 'seguranca-autenticacao-novera', 
       crie o arquivo /app/(auth)/login/page.tsx
       com:
       - Form com email e senha
       - Validação com Zod
       - Integração com /api/auth/login
       - Feedback de erro
       - Loading state"

Claude (com skill em mente):
├─ Gera página completa
├─ Usa schemas já definidos na skill
├─ Segue padrão de segurança da skill
└─ Sem precisar repetir validações
```

### Exemplo 2: "Crie tabela de precificações"
```
Você: "Usando 'modulo-precificacao-builder',
       gere a tabela de histórico de precificações
       com:
       - Colunas: Data, Produto, Plataforma, Preço, Lucro, Margem
       - Filtros por período e plataforma
       - Paginação 50 itens/página
       - Botão para clonar precificação"

Claude (com skill):
└─ Gera componente DataTable pronto
```

### Exemplo 3: "Crie os testes unitários"
```
Você: "A skill 'modulo-precificacao-builder' tem 
       testes básicos. Expanda para:
       - Validação de entrada inválida
       - Casos de erro
       - Performance (calcular 1000 preços)"

Claude:
└─ Expande os testes existentes
```

---

## 🔧 Estrutura de Pastas do Projeto (Após Implementar)

```
novera-co-app/
├── prisma/
│   ├── schema.prisma         ← Da skill database-schema-novera
│   └── seed.ts               ← Inserir 16 produtos
│
├── lib/
│   ├── supabase/
│   │   ├── auth-config.ts    ← Da skill seguranca-autenticacao-novera
│   │   ├── server.ts
│   │   └── client.ts
│   ├── auth/
│   │   ├── session.ts        ← JWT management
│   │   ├── roles.ts          ← RBAC (admin/operador/visualizador)
│   │   └── middleware.ts     ← protectedRoute()
│   ├── pricing/
│   │   ├── calculator.ts     ← Da skill modulo-precificacao-builder
│   │   └── __tests__/
│   │       └── calculator.test.ts
│   ├── rate-limit.ts         ← Da skill seguranca
│   ├── audit-logger.ts       ← Logging
│   └── validations/
│       └── pricing-schemas.ts ← Zod schemas
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx      ← Tela de login (usar skill seguranca)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts   ← Da skill seguranca
│   │   │   └── logout/route.ts
│   │   └── pricings/
│   │       ├── calculate/route.ts  ← Da skill modulo-precificacao-builder
│   │       ├── compare/route.ts
│   │       └── [id]/route.ts
│   └── (dashboard)/
│       ├── layout.tsx        ← Sidebar + Header
│       └── precificacao/
│           ├── page.tsx      ← Listagem
│           ├── nova/
│           │   └── page.tsx  ← Calculadora (usar skill)
│           └── [id]/
│               └── page.tsx  ← Detalhes
│
├── components/
│   ├── pricing/
│   │   ├── PricingCalculator.tsx    ← Da skill modulo-precificacao-builder
│   │   ├── PlatformComparator.tsx
│   │   └── PricingHistoryTable.tsx
│   ├── ui/                          ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── auth/
│       └── LoginForm.tsx            ← Da skill seguranca
│
├── middleware.ts             ← Autenticação (da skill seguranca)
├── next.config.js            ← Headers de segurança (da skill seguranca)
├── .env.local                ← Secrets (NUNCA comitar)
├── .env.example              ← Template
└── package.json
```

---

## 📚 Ordem Correta de Leitura das Skills

1. **database-schema-novera** ← Começa por aqui (sem isso, nada funciona)
2. **seguranca-autenticacao-novera** ← Segundo (protege tudo)
3. **modulo-precificacao-builder** ← Terceiro (lógica de negócio)

---

## 🎁 Exemplos de Prompts para Claude

### Prompt 1: Implementar toda a precificação
```
Usar a skill 'modulo-precificacao-builder' para criar:

1. /lib/pricing/calculator.ts - PricingCalculator class
2. /lib/validations/pricing-schemas.ts - Zod schemas
3. /app/api/pricings/calculate/route.ts - POST endpoint
4. /app/api/pricings/compare/route.ts - Comparador
5. /components/pricing/PricingCalculator.tsx - UI
6. /app/dashboard/precificacao/nova/page.tsx - Página

Requirements:
- Usar fórmula exata da skill
- Validar com Zod
- Log auditoria em cada ação
- Rate limit em APIs
- Componente responsivo
```

### Prompt 2: Setup de autenticação completo
```
Usar a skill 'seguranca-autenticacao-novera' para:

1. Setup Supabase Auth
2. Criar /app/(auth)/login/page.tsx com form
3. Implementar /app/api/auth/login/route.ts
4. Criar middleware.ts protegendo /dashboard/*
5. Adicionar headers de segurança no next.config.js
6. Setup RLS no Supabase

Requisitos:
- JWT em httpOnly cookies
- Rate limiting no login
- Verificar roles (admin/operador/visualizador)
- Log de tentativas falhadas
```

### Prompt 3: Setup inicial do banco
```
Usar a skill 'database-schema-novera' para:

1. Criar todas as 10 tabelas no Supabase
2. Ativar RLS em cada uma
3. Criar índices otimizados
4. Fazer seed com 16 produtos da planilha
5. Configurar 5 plataformas padrão (ML, Shopee, Amazon, Site, etc)

Formato:
- SQL direto para Supabase SQL Editor
- Ou Prisma migration se preferir
```

---

## ✅ Checklist de Uso das Skills

### Antes de Começar
- [ ] Ler as 3 skills completamente
- [ ] Clonar `novera-co-app` repo
- [ ] Setup Node.js 18+, npm/yarn
- [ ] Criar conta Supabase gratuita
- [ ] Copiar `.env.example` → `.env.local`

### Implementação
- [ ] Usar skill `database-schema-novera` para setup do banco
- [ ] Usar skill `seguranca-autenticacao-novera` para auth
- [ ] Usar skill `modulo-precificacao-builder` para precificação
- [ ] Testar login/logout
- [ ] Testar calculadora de preços
- [ ] Verificar logs de auditoria

### Qualidade
- [ ] Rodar testes (npm test)
- [ ] Verificar segurança (headers, RLS, tokens)
- [ ] Testar no mobile (responsivo)
- [ ] Performance (Lighthouse)

### Deploy
- [ ] Setup domínio app.norecaco.com.br
- [ ] Variáveis de ambiente em produção
- [ ] HTTPS obrigatório
- [ ] Monitoramento (Sentry, etc)

---

## 🆘 Troubleshooting

### "Não consigo executar as queries SQL"
→ Use Supabase SQL Editor (painel à esquerda)
→ Ou use Prisma: `npx prisma migrate dev --name init`

### "RLS está bloqueando meus dados"
→ Verificar se `organization_id` está sendo filtrado
→ Testar query: `SELECT * FROM products` (deve retornar resultados)

### "JWT token expirou"
→ Implementar refresh token automático (skill tem código)
→ Ou fazer logout e login novamente

### "Rate limiting está muito restritivo"
→ Ajustar valores em `lib/rate-limit.ts`
→ Aumentar limite: `Ratelimit.slidingWindow(200, '1 m')`

### "Skills não funcionam com Claude"
→ Certifique-se de mencionar o nome da skill
→ Ex: "Usando a skill 'modulo-precificacao-builder'..."
→ Copie o caminho da skill no prompt

---

## 📞 Próximos Passos

1. **Hoje**: Revisar as 3 skills
2. **Amanhã**: Começar implementação (database → auth → precificação)
3. **Esta semana**: MVP rodando com precificação funcional
4. **Próxima semana**: Vendas + SEO + Polish

---

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod Validation](https://zod.dev)

---

**Última atualização**: 2025-05-08

**Criado para**: Novera Co. MVP  
**Domínio**: www.norecaco.com.br  
**Stack**: Next.js 14 + Supabase + shadcn/ui
