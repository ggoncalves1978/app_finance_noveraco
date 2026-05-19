# 🚀 GUIA RÁPIDO: Como Copiar as Skills no Seu Projeto

## 📦 O Que Você Recebeu

3 skills prontas para usar no MVP Novera Co.:

```
skills/
├── database-schema-novera/SKILL.md          ← Schemas SQL + Prisma
├── seguranca-autenticacao-novera/SKILL.md   ← Auth + JWT + Segurança
├── modulo-precificacao-builder/SKILL.md     ← Calculadora de preços
└── README.md                                 ← Este arquivo
```

---

## 🎯 Passo 1: Criar Estrutura de Pastas

No seu projeto Next.js, crie:

```bash
mkdir -p skills
mkdir -p skills/database-schema-novera
mkdir -p skills/seguranca-autenticacao-novera
mkdir -p skills/modulo-precificacao-builder
```

## 🎯 Passo 2: Copiar os Arquivos

Os 3 arquivos `.md` que você baixou vão para:

```bash
# A partir da pasta raiz do seu projeto

# Copiar database skill
cp SKILL.md skills/database-schema-novera/SKILL.md

# Copiar segurança skill
cp SKILL.md skills/seguranca-autenticacao-novera/SKILL.md

# Copiar precificação skill
cp SKILL.md skills/modulo-precificacao-builder/SKILL.md

# Copiar README
cp README.md skills/README.md
```

**Ou simplesmente:**
1. Crie a pasta `skills` na raiz do projeto
2. Copie cada `SKILL.md` para sua respectiva pasta

---

## 📁 Estrutura Final Esperada

```
seu-projeto-novera/
├── skills/
│   ├── database-schema-novera/
│   │   └── SKILL.md
│   ├── seguranca-autenticacao-novera/
│   │   └── SKILL.md
│   ├── modulo-precificacao-builder/
│   │   └── SKILL.md
│   └── README.md
│
├── app/
├── lib/
├── components/
├── middleware.ts
├── next.config.js
├── prisma/
│   └── schema.prisma
├── .env.local
├── package.json
└── ... outros arquivos
```

---

## 🔨 Passo 3: Usar as Skills com Claude

Agora que as skills estão no seu projeto, você usa assim:

### Opção A: Referência Local
```bash
# Ler a skill diretamente
cat skills/database-schema-novera/SKILL.md

# Copiar código SQL/TypeScript conforme precisa
```

### Opção B: Com Claude (Recomendado)
```
Você: "Tenho as skills em /skills/modulo-precificacao-builder/SKILL.md
       
       Usando essa skill, crie:
       1. /lib/pricing/calculator.ts
       2. /app/api/pricings/calculate/route.ts
       3. /components/pricing/PricingCalculator.tsx"

Claude: Gera código baseado na skill, sem precisar repetir specs
```

---

## 💡 Como Referenciar as Skills a Claude

### Formato Correto:
```
"Usando a skill 'modulo-precificacao-builder', crie..."
"Baseado na skill 'database-schema-novera', implemente..."
"Com referência à skill 'seguranca-autenticacao-novera', configure..."
```

### Com Caminho (se quiser ser bem específico):
```
"Com base em /skills/modulo-precificacao-builder/SKILL.md, gere..."
```

### Anexando a Skill Inteira:
```
"Aqui está a skill completa:
[copia e cola o conteúdo de SKILL.md]

Usando isso, crie os arquivos..."
```

---

## 🚀 Workflow Recomendado

### Dia 1: Setup do Banco
```bash
# 1. Abrir /skills/database-schema-novera/SKILL.md
cat skills/database-schema-novera/SKILL.md

# 2. Executar SQL no Supabase
# (copiar schemas SQL → Supabase SQL Editor → Run)

# Ou usar Prisma:
cp skills/database-schema-novera/SKILL.md | grep "datasource\|generator" > prisma/schema.prisma
npx prisma migrate dev --name init
```

### Dia 2-3: Autenticação
```
Prompt para Claude:
"Usando a skill 'seguranca-autenticacao-novera', crie:
- /app/(auth)/login/page.tsx
- /app/api/auth/login/route.ts
- /app/api/auth/logout/route.ts
- /middleware.ts
- Configuração de headers de segurança no next.config.js"
```

### Dia 4-5: Precificação
```
Prompt para Claude:
"Usando a skill 'modulo-precificacao-builder', crie:
- /lib/pricing/calculator.ts
- /app/api/pricings/calculate/route.ts
- /components/pricing/PricingCalculator.tsx
- Testes em /lib/pricing/__tests__/calculator.test.ts"
```

---

## 📖 Leitura das Skills (Ordem)

1. **skills/README.md** ← Leia PRIMEIRO (guia geral)
2. **skills/database-schema-novera/SKILL.md** ← Setup do banco
3. **skills/seguranca-autenticacao-novera/SKILL.md** ← Auth
4. **skills/modulo-precificacao-builder/SKILL.md** ← Precificação

---

## 🎁 Exemplos de Prompts Completos

### Exemplo 1: "Configura tudo de uma vez"
```
Tenho as skills em:
- /skills/database-schema-novera/SKILL.md
- /skills/seguranca-autenticacao-novera/SKILL.md
- /skills/modulo-precificacao-builder/SKILL.md

Usando TODAS as 3 skills, gere:
1. Prisma schema (com seed de 16 produtos)
2. Sistema de autenticação completo (login/logout + JWT + RLS)
3. Módulo de precificação (calculadora + histórico + comparador)

Estrutura do projeto:
- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- shadcn/ui + Tailwind

Formato: Envie os arquivos prontos para copiar/colar em:
- /prisma/schema.prisma
- /lib/supabase/*
- /lib/auth/*
- /lib/pricing/*
- /app/api/auth/*
- /app/api/pricings/*
- /app/(auth)/login/*
- /components/pricing/*
- /middleware.ts
- /next.config.js
```

### Exemplo 2: "Só o módulo de precificação"
```
Usando a skill '/skills/modulo-precificacao-builder/SKILL.md', crie:

1. Classe PricingCalculator com:
   - Método calculate(input: PricingInput)
   - Método comparePlatforms()
   - Validações e warnings
   - Testes unitários

2. Schemas Zod para validação

3. API Routes:
   - POST /api/pricings/calculate
   - POST /api/pricings/compare
   - GET /api/pricings/history

4. Componentes React:
   - PricingCalculator (form)
   - PlatformComparator (tabela + gráfico)
   - PricingHistoryTable

Requirements:
- TypeScript strict
- Validação com Zod
- Log de auditoria
- Rate limiting
- Responsivo (mobile)
```

### Exemplo 3: "Implemente testes"
```
A skill 'modulo-precificacao-builder' tem testes básicos.

Expanda para:
1. Testar todos os 16 produtos reais da planilha
2. Testar validações (margem < 5%, > 100%, etc)
3. Testar comparação entre 5 plataformas
4. Testar warnings (preço muito alto, lucro muito baixo, etc)
5. Testar performance (calcular 1000 preços em <100ms)
6. Integration tests para APIs

Formato: Jest + React Testing Library
```

---

## ⚙️ Setup Inicial (Checklist)

- [ ] Node.js 18+ instalado
- [ ] Next.js 14 criado (`npx create-next-app@latest`)
- [ ] Supabase conta criada (gratuita em supabase.com)
- [ ] Pasta `skills/` criada no projeto
- [ ] 3 arquivos `.md` copiados para `skills/`
- [ ] Lido o `skills/README.md`
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Prisma instalado (`npm install @prisma/client`)
- [ ] shadcn/ui configurado (`npx shadcn-ui@latest init`)

---

## 🆘 Troubleshooting

### "Não consigo achar as skills"
```bash
# Verificar se estão lá
ls -la skills/
# Output esperado:
# database-schema-novera/SKILL.md
# seguranca-autenticacao-novera/SKILL.md
# modulo-precificacao-builder/SKILL.md
# README.md
```

### "Claude não reconhece a skill"
Certifique-se de mencioná-la explicitamente:
```
❌ "Crie um arquivo de autenticação"
✅ "Usando a skill 'seguranca-autenticacao-novera', crie /app/api/auth/login/route.ts"
```

### "Qual skill usar para X?"
Consulte a **tabela de roteamento**:

| Necessidade | Skill |
|----------|-------|
| Setup de banco, tabelas, seed | `database-schema-novera` |
| Login, JWT, autenticação | `seguranca-autenticacao-novera` |
| Calculadora de preços | `modulo-precificacao-builder` |
| Todas as acima | Mencione as 3 |

### "Preciso de mais skills (Vendas, SEO)"
Você pode:
1. Chamar Claude para criá-las (mesmo padrão)
2. Estender as skills existentes
3. Integrar com as 3 bases que você tem

---

## 📞 Próximos Passos

1. **Agora**: Copiar as skills para seu projeto
2. **Hoje**: Ler skills/README.md e database-schema-novera
3. **Amanhã**: Começar implementação (database → auth → pricing)
4. **Esta semana**: MVP rodando

---

## 📚 Índice de Skills

### database-schema-novera
- **Para quê**: Setup do banco de dados PostgreSQL (Supabase)
- **Inclui**: 10 tabelas, RLS, índices, seed com 16 produtos
- **Como usar**: SQL direto ou Prisma migration
- **Tempo de setup**: ~30 minutos

### seguranca-autenticacao-novera
- **Para quê**: Autenticação, autorização e segurança
- **Inclui**: Supabase Auth, JWT, middleware, roles, headers CSP, rate limiting
- **Como usar**: Copiar código TypeScript conforme precisa
- **Tempo de setup**: ~2-3 horas

### modulo-precificacao-builder
- **Para quê**: Calculadora de preços multi-plataforma
- **Inclui**: Fórmulas, validações, API routes, componentes React, testes
- **Como usar**: Implementar PricingCalculator class + API + UI
- **Tempo de setup**: ~4-5 horas

---

## 🎯 Meta Final

Depois de usar as 3 skills, você terá:
- ✅ Banco de dados estruturado (PostgreSQL)
- ✅ Login seguro com JWT e RLS
- ✅ Calculadora de preços com histórico
- ✅ API protegida com rate limiting
- ✅ Componentes React prontos
- ✅ Testes unitários
- ✅ Log de auditoria
- ✅ Pronto para expandir com Vendas + SEO

---

**Boa sorte com o MVP! 🚀**

Qualquer dúvida, releia as skills — elas têm resposta para tudo!
