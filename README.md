# [18+]Check

Verificação de imagem própria e checagem de contato suspeito, para vítimas de
vazamento íntimo, golpe romântico e sextorsão.

O usuário prova que é ele mesmo — identidade por CPF e prova de vida — e então
busca **a própria imagem** em plataformas de conteúdo adulto. Separadamente,
pode checar se a foto e o perfil de alguém que o procurou são reaproveitados.

🌐 **[18check.online](https://18check.online)** · API em `api.18check.online`

---

## Antes de mexer

Leia dois arquivos, nesta ordem:

1. **[CLAUDE.md](CLAUDE.md)** — regras de blindagem. Preço, fonte, cor e imagem
   não se alteram sem autorização expressa do proprietário.
2. **[docs/CONTEXTO.md](docs/CONTEXTO.md)** — por que o produto é assim, o que já
   foi tentado, e as armadilhas que não são óbvias no código.

O segundo evita retrabalho. Há decisões neste repositório que parecem estranhas
até você saber o motivo.

---

## Como está montado

```
                       Internet
                          │
                    ┌─────▼─────┐
                    │   nginx   │  HTTPS, portas 80/443
                    └─────┬─────┘
              ┌───────────┴───────────┐
     18check.online            api.18check.online
     React 19 + Vite 8         Node + Express + Prisma
     Tailwind 4                PostgreSQL
```

Dois repositórios:

| | Repositório | O que roda |
|---|---|---|
| Frontend | `AuraDUE/-18-Check` | React 19, TypeScript, Vite 8, Tailwind 4 |
| Backend | `AuraDUE/18check-backend` | Node, Express, Prisma, PostgreSQL |

> A consolidação dos dois num monorepo `AuraDUE/18check` está planejada — ver
> [docs/inventario-e-plano.md](docs/inventario-e-plano.md).

---

## Rodando localmente

### Frontend

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run lint
```

Aponta para a API de produção por padrão. Para usar um backend local, crie um
`.env.local` com `VITE_API_URL=http://localhost:3000/api`.

### Backend

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Precisa de um `.env` com pelo menos `DATABASE_URL`, `JWT_SECRET` e as chaves do
Stripe. **Nunca commite o `.env`** — já houve incidente com isso, descrito no
CONTEXTO.

---

## Rotas

### Público

| | |
|---|---|
| `/` | landing |
| `/privacidade` · `/termos` | políticas |
| `/login` · `/register` · `/forgot-password` | acesso |

### Autenticado

| | |
|---|---|
| `/app` | painel |
| `/app/search` | verificação da própria imagem — consentimento, prova de vida, CPF, varredura |
| `/app/checar-contato` | checagem de foto, @, nome e telefone de um suspeito |
| `/app/history` · `/app/plans` · `/app/conta` | histórico, planos, conta |

### API

```
POST /api/auth/login · /register · /refresh · /forgot-password
GET  /api/user/me
POST /api/identity/session · /liveness · /identity
GET  /api/identity/liveness-credentials
POST /api/scan/self          GET /api/scan/self/:id
POST /api/scan/suspect       GET /api/scan/suspect/:id
POST /api/billing/checkout
```

Todas respondem `{ success, data }` em caso de êxito e `{ success, error }` em
caso de falha. O frontend lê esse formato em `src/lib/apiError.ts`.

---

## Deploy

Servidor Hetzner, Ubuntu, `178.104.66.47`.

```bash
BRANCH=<branch> ./deploy/deploy.sh --dry-run   # simula
BRANCH=<branch> ./deploy/deploy.sh             # publica, com backup
./deploy/rollback.sh                           # desfaz
```

> ⚠️ **A máquina hospeda outros sete projetos.** Restart sempre pelo nome:
> `pm2 restart 18check-backend`. Nunca `pm2 restart all`.

Passo a passo completo em **[DEPLOY.md](DEPLOY.md)**. Quem opera do Windows tem
uma versão pelo PowerShell em **[DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md)**.

---

## Documentação

| Arquivo | Para quê |
|---|---|
| [docs/CONTEXTO.md](docs/CONTEXTO.md) | por que o produto é assim; leia antes de mexer |
| [docs/inventario-e-plano.md](docs/inventario-e-plano.md) | inventário, achados, preços, plano do monorepo |
| [docs/contrato-scan-suspect.md](docs/contrato-scan-suspect.md) | contrato da API de checagem de suspeito |
| [DEPLOY.md](DEPLOY.md) · [DEPLOY-WINDOWS.md](DEPLOY-WINDOWS.md) | publicação e manutenção do servidor |

---

## Design system

Não altere sem autorização.

```
Display   Playfair Display        Fundo    #0C0C0E
Corpo     DM Sans                 Ouro     #D4AF5F
Mono      DM Mono
```

Moeda: **BRL**, em todo o produto. Idioma: **português**, único ativo — os
outros 11 arquivos de tradução descrevem o produto anterior e não devem ser
religados sem tradução nova. O motivo está em `src/i18n/index.ts`.

---

**Proprietário:** Marcos Costa — nml.costa@gmail.com — AuraTECH
