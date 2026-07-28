# Inventário e plano de reorganização — [18+]Check

Levantamento feito em 27/07/2026, depois do deploy da nova direção. Cobre os dois
repositórios, o servidor, os preços e o caminho até o monorepo `AuraDUE/18check`.

**Nada deste documento foi executado ainda.** A limpeza só acontece após aprovação.

---

## 1. O que existe hoje

### Repositórios

| Repositório | Papel | Situação |
|---|---|---|
| `AuraDUE/-18-Check` | frontend em produção | ativo — é de onde o servidor puxa desde hoje |
| `AMPE-Tech/-18-Check` | frontend, origem histórica | o servidor apontava para cá até hoje |
| `AuraDUE/18check-frontend` | frontend | sem push desde 07/04 — provável abandonado |
| `AuraDUE/18check-backend` | backend em produção | ativo |

Quatro endereços para dois sistemas, em duas organizações. É o que motiva a
consolidação.

### Peso

| | Total | `.git` | Maior peso |
|---|---|---|---|
| Frontend | 23 MB | 17 MB | `dist/` 12 MB, `public/` 9,8 MB |
| Backend | 856 KB | — | código, 4.836 linhas |

183 arquivos rastreados no frontend, dos quais **95 são imagens** (48 jpg, 38 svg,
9 png) — quase toda a pasta `public/`.

### Servidor — `ubuntu-4gb-nbg1-3` (Hetzner, Nuremberg, CPX22)

```
178.104.66.47 · 2 vCPU · 4 GB RAM · 80 GB (23% usados) · US$ 9,49/mês
```

Hospeda **sete projetos**, não só o 18check:

```
/var/www/18check-frontend/dist   ← nginx serve daqui (18check.online)
/var/www/18check-backend         ← Node (api.18check.online)
/var/www/auracarbo     /var/www/auralo-crm    /var/www/auratg-gate
/var/www/auralegal     /var/www/auratg-demo   /var/www/auraaudit
/var/www/auraloa       /var/www/html
```

Quatro aplicações no pm2: `18check-backend`, `auraaudit`, `auralo-crm`, `auraloa`.
**Restart sempre pelo nome** — `pm2 restart all` derruba os outros negócios.

Pendências do sistema: 22 atualizações e um reinício requerido. Backups da Hetzner
**desligados** (custam ~US$ 1,90/mês).

---

## 2. Achados críticos

Em ordem de gravidade. Os três primeiros são anteriores a este trabalho.

### 2.1 🔴 Segredos commitados no Git

**Nove arquivos `.env` estão versionados** no `AuraDUE/18check-backend`:

```
.env.bak-2026-04-29            .env.bak-2026-05-01-pre-facecheck-token
.env.bak-2026-04-29-pm         .env.bak-2026-05-02-pre-apify-token
.env.bak-2026-04-30-pre-live   .env.bak-2026-05-07-pre-live-flip
.env.bak-2026-04-30-pre-testing-mode
.env.bak-2026-05-07-pre-token-rotation
.env.bak.20260416_154314
```

Contêm, com valores reais:

| Segredo | O que dá para fazer com ele |
|---|---|
| `STRIPE_SECRET_KEY` | criar cobranças, emitir reembolsos, ler clientes |
| `STRIPE_WEBHOOK_SECRET` | forjar confirmações de pagamento |
| `JWT_SECRET` | **assinar sessão de qualquer usuário** — entrar como qualquer conta |
| `DATABASE_URL` | credenciais do banco |
| `FACECHECK_API_KEY` | gastar os créditos comprados |
| `APIFY_TOKEN`, `GOOGLE_API_KEY`, `BRAVE_API_KEY`, `TRUECALLER_API_KEY` | consumir APIs pagas |

O repositório é privado, o que limita a exposição — mas o segredo está no
**histórico**, e apagar o arquivo hoje não o remove do passado. Qualquer pessoa com
acesso de leitura, agora ou no futuro, alcança todos eles.

**Consequência para o plano: essas chaves precisam ser rotacionadas.** Limpar o
repositório não desfaz a exposição.

### 2.2 🔴 Dado pessoal commitado

`backups/users_deleted_2026-04-29.csv` está versionado e contém:

```
id, email, passwordHash, name, credits, stripeCustomerId, plan, ...
```

São **usuários excluídos**. Sob a LGPD, quem pediu exclusão tem direito à eliminação
do dado — e o dado continua no Git, com hash de senha e identificador de cliente
Stripe, permanentemente. Num produto cujo argumento de venda é justamente a LGPD,
esse arquivo é o risco mais desconfortável do levantamento.

### 2.3 🔴 Crédito liberado antes do dinheiro entrar

Isto responde diretamente à pergunta sobre o fluxo de caixa.

O checkout aceita **boleto** (`payment_method_types: ["card","boleto"]`). Com boleto,
o Stripe dispara `checkout.session.completed` **assim que o boleto é gerado**, com
`payment_status: "unpaid"` — o cliente tem até 3 dias para pagar, ou nunca pagar.

E o código libera o crédito nesse evento, sem conferir nada:

```js
case "checkout.session.completed": {
  const session = event.data.object;
  if (session.metadata?.type === "credits") {
    // ... nenhuma checagem de payment_status
    await prisma.user.update({ data: { credits: { increment: credits } } });
```

Não existe tratamento de `checkout.session.async_payment_succeeded`, que é o evento
que avisa quando o boleto de fato compensou.

**Na prática hoje:** alguém gera um boleto, recebe o crédito na hora, roda a busca
— que consome crédito do FaceCheck já pago pelo Marcos — e pode simplesmente nunca
pagar o boleto.

### 2.4 🟠 Os pacotes de busca estão quebrados e mal precificados

O `Plans.tsx` oferece pacotes em dólar:

```
2 buscas  $54   ($27/busca)      5 buscas  $115  ($23/busca)
3 buscas  $75   ($25/busca)     10 buscas  $199  ($19.90/busca)
```

Dois problemas somados:

**Não funcionam.** O backend busca `env.STRIPE_PRICE_PACK2`, `PACK3`, `PACK5`,
`PACK10` — e **nenhuma dessas variáveis existe no `.env`**. Clicar em qualquer
pacote cai em `throw new Error("Plano invalido: pack2")`.

**E se funcionassem, seriam absurdos.** A busca avulsa custa R$ 49,90. O pacote de
2 custa $27/busca = **R$ 137 por busca** — 2,7 vezes mais caro que comprar avulso.
Os pacotes foram precificados quando a avulsa custava $29, e ficaram para trás na
migração para real.

### 2.5 🟡 `/scan/self` não debita crédito

O `requireCredits` confere o saldo mas não desconta, e o `scan.service.js` também
não. A varredura da própria imagem — a mais cara, porque envolve prova de vida AWS
mais busca facial — está saindo de graça. O `/scan/suspect` debita corretamente.

### 2.6 🟡 Orçamento do FaceCheck perto do limite

```
150 créditos comprados · 3 por busca · limite rígido em 40 buscas · 3 consumidas
```

Restam **cerca de 37 buscas com foto** antes do guard bloquear. Suficiente para
testes, insuficiente para divulgação.

### 2.7 🟡 Google comprado e nunca ligado

`GOOGLE_API_KEY` e `GOOGLE_CSE_ID` têm valores reais no `.env` e são carregados em
`src/config/env.js` — mas **nenhuma linha do código os utiliza**. Integração paga e
nunca escrita. PimEyes não aparece em lugar nenhum do código.

---

## 3. Preço — pesquisa de mercado e proposta

### O mercado, convertido (USD/BRL = 5,08 em 27/07/2026)

| Serviço | Preço | Em real | Modelo |
|---|---|---|---|
| PimEyes Open Plus | US$ 29,99/mês | **R$ 152/mês** | assinatura, ~75 buscas/dia |
| PimEyes PROtect | US$ 79,99/mês | R$ 406/mês | assinatura + remoção de conteúdo |
| Social Catfish | US$ 27,48/mês | **R$ 140/mês** | assinatura, 100 buscas/mês |
| Social Catfish ilimitado | US$ 36/mês | R$ 183/mês | assinatura |
| FaceCheck.ID | ~US$ 6 / 30 buscas | ~R$ 1/busca | crédito, cripto, sem suporte |
| Meta Verified Brasil | — | **R$ 69,90/mês** | âncora de assinatura no Brasil |

O Meta Verified é a referência mais útil: é o que o consumidor brasileiro já aceita
pagar por mês num serviço de verificação de identidade.

### Onde o 18check está

```
Investigação avulsa    R$ 49,90   ≈ US$ 9,82
Monitoramento mensal   R$ 129/mês ≈ US$ 25,39
```

O mensal fica **entre** o Meta Verified (R$ 69,90) e o Social Catfish (R$ 140) /
PimEyes (R$ 152). É posição defensável — abaixo dos internacionais, o que faz
sentido pelo poder de compra local, e acima da âncora de massa, o que se justifica
pela prova de vida e pelo suporte jurídico.

**Conclusão: o preço atual está bem posicionado. A recomendação não é mudá-lo.**

### O que precisa mudar: moeda única em real

O produto é **exclusivamente brasileiro** hoje — i18n travado em português,
identidade por CPF, argumento de LGPD, boleto no checkout. O `CLAUDE.md` ainda diz
"Moeda: USD global", o que deixou de ser verdade.

Proposta: **tudo em BRL**, sem exceção, ancorado na avulsa de R$ 49,90 que já está
no ar e que os clientes já viram.

| Produto | Preço | Por busca | Desconto |
|---|---|---|---|
| Investigação avulsa | R$ 49,90 | R$ 49,90 | — |
| Pacote 3 buscas | R$ 129,90 | R$ 43,30 | 13% |
| Pacote 5 buscas | R$ 199,90 | R$ 39,98 | 20% |
| Pacote 10 buscas | R$ 349,90 | R$ 34,99 | 30% |
| Monitoramento mensal | R$ 129,00/mês | — | — |
| **Consulta oficial** (adicional) | **+ R$ 25,00** | por consulta | — |

Descontinuar os pacotes de 2 e 4 — granularidade demais para pouca diferença.

### Confirmar não é documentar — e é isso que sustenta o preço

Decidido em 27/07/2026, corrigindo a proposta anterior de baixar a entrada para
R$ 29,90.

| | | O que entrega |
|---|---|---|
| Investigação | **R$ 49,90** | a **confirmação** — o usuário sabe o que houve e consegue agir |
| Consulta oficial | + R$ 25,00 | CPF e nome na Receita, mandado em aberto no BNMP |
| Dossiê documentado | **a definir** | a **prova** — documento oficial, rastreio das alterações, relatório datado |

Dizer "essa imagem é falsa" e **provar** que se trata de outra pessoa são
produtos diferentes. O primeiro resolve a decisão imediata: cortar contato, não
transferir dinheiro. O segundo serve a boletim de ocorrência, contestação
bancária e notificação à plataforma — e consome muito mais, porque envolve
recuperar documento oficial, acompanhar as alterações ao longo do tempo e gerar
relatório.

A investigação não desce de R$ 49,90. Baratear a entrada desvalorizaria a
confirmação, que é o produto — e não um degrau para vender o próximo.

**O dossiê tem urgência real, não fabricada.** O perfil, as fotos e o número
ficam no ar só até o golpe se completar; depois o golpista apaga tudo. Quem
compra o dossiê está dentro da janela em que a prova ainda existe, e essa janela
não volta. É o argumento de venda mais honesto que este produto tem.

**Faixa sugerida para o dossiê: R$ 149,90 a R$ 299,90.** Um laudo pericial no
Brasil custa de R$ 500 a R$ 3.000; o dossiê é mais simples que isso, mas muito
acima da consulta. R$ 199,90 fica no meio e mantém a proporção de quatro vezes a
investigação, que é fácil de justificar. **Decisão pendente do proprietário.**

### Consulta oficial — o adicional de R$ 25

Decidido em 27/07/2026. Cobrado **por consulta**, somado a qualquer investigação.
Entrega as duas checagens em base oficial:

- **CPF e nome** contra a base da Receita, via Serpro Datavalid (`/pf-basica`)
- **Mandado de prisão em aberto** no BNMP do CNJ, por nome ou alcunha

Não é um degrau da escada e sim um acréscimo, porque depende de dado que o
usuário pode não ter — se ele não recebeu CPF nem nome, não há o que consultar.

**Margem.** O Serpro cobra por consulta e o BNMP via provedor idem; somados
ficam na casa de poucos reais. Contra R$ 25,00 de receita, a margem é larga
mesmo no pior cenário de preço. Confirme a tabela da sua contratação Serpro
para fechar o número — trabalhei com a ordem de grandeza, não com o contrato.

**O que falta para vender.** O preço está decidido, mas ainda não é cobrável:
precisa de um `STRIPE_PRICE_CONSULTA_OFICIAL` criado no Stripe e declarado no
`.env`, de um `planType` correspondente no `billing.service.js`, e da chamada
ao `validateRegistration` já implementado no adaptador Serpro. Enquanto isso
não existir, o valor fica só registrado aqui.

**Uma observação sobre a proporção.** R$ 25,00 sobre uma entrada de R$ 29,90
quase dobra o ticket. O valor percebido justifica — "checamos na base oficial
do governo" é argumento forte — mas vale acompanhar a taxa de adesão nas
primeiras semanas. Se poucos aceitarem, o problema tende a ser a proporção e
não o valor absoluto.

Custo de provedor por busca fica em torno de **R$ 1 a R$ 3** (FaceCheck mais prova
de vida AWS), contra R$ 49,90 de receita. A margem é confortável mesmo depois da
taxa do Stripe. **Confirme a nota fiscal do FaceCheck** para fechar esse número —
trabalhei com estimativa de mercado, não com o valor que vocês pagaram.

> Preço é área blindada pelo `CLAUDE.md`. Nada da tabela acima é aplicado sem sua
> confirmação explícita.

---

## 4. Dinheiro entrar antes de sair — é possível, e falta pouco

A pergunta era: dá para o cliente pagar primeiro e só depois pagarmos o provedor,
sem depender do cartão de crédito pessoal?

**Sim, e a arquitetura já está quase toda lá.** Três peças:

### 4.1 A ordem já está correta — com um furo

O crédito é concedido no webhook do Stripe, não na criação do checkout. Ou seja,
para **cartão**, o dinheiro entra antes de qualquer custo. Correto.

O furo é o boleto (item 2.3). Correção:

```js
case "checkout.session.completed": {
  const session = event.data.object;
  // Boleto chega aqui como "unpaid" — o crédito espera o dinheiro compensar
  if (session.payment_status !== "paid") break;
  ...
}

case "checkout.session.async_payment_succeeded": {
  // O boleto compensou: agora sim libera o crédito
}
```

Com isso, **em nenhum meio de pagamento o crédito sai antes do dinheiro entrar.**

### 4.2 Prefira provedores pós-pagos

| Provedor | Cobrança | Cartão pessoal? |
|---|---|---|
| AWS Rekognition (prova de vida) | **pós-pago**, fatura mensal | não — boleto/débito da conta AWS |
| Google Cloud / Custom Search | **pós-pago** | não |
| FaceCheck.ID | **pré-pago**, pacote de créditos | é o único que exige adiantamento |
| Apify | pré-pago ou assinatura | — |

O único ponto de desembolso antecipado é o FaceCheck. E é pequeno: o pacote de 150
créditos rende 50 buscas, que vendidas a R$ 49,90 geram **R$ 2.495** de receita.
Depois da primeira dezena de vendas o ciclo se auto-financia.

### 4.3 Tirar o cartão pessoal do caminho

1. Payout do Stripe cai em **conta bancária PJ**
2. Recarga do FaceCheck feita com **cartão virtual da conta PJ** (qualquer banco
   digital emite), nunca com cartão pessoal
3. AWS e Google configurados para **débito na conta PJ**, já que são pós-pagos
4. Alerta automático quando os créditos do FaceCheck baixarem de um limite — hoje
   existe o guard que bloqueia, mas ninguém é avisado antes de bloquear

O item 4 é código novo e pequeno: o `facecheck-budget.js` já sabe o saldo, falta só
disparar um aviso.

---

## 5. Como fica o monorepo

```
AuraDUE/18check
├── README.md                    visão geral, como rodar cada parte
├── CLAUDE.md                    blindagem unificada, atualizada
├── .gitignore                   .env, node_modules, dist.bak, backups
├── docs/
│   ├── DEPLOY.md
│   ├── DEPLOY-WINDOWS.md
│   ├── inventario-e-plano.md    (este arquivo)
│   └── contrato-scan-suspect.md
├── deploy/
│   ├── deploy.sh                aprende a publicar a partir de frontend/
│   ├── rollback.sh
│   └── nginx/
├── frontend/                    React 19 + Vite 8 + Tailwind 4
│   ├── src/  public/  index.html  package.json
│   └── (sem dist/ versionado)
└── backend/                     Node + Express + Prisma
    ├── src/  prisma/  package.json
    └── (sem .env, sem .bak, sem backups/)
```

### Migração com histórico preservado

Uso `git subtree`, que traz o histórico completo dos dois repositórios sem reescrever
commits. `frontend/src/pages/Landing.tsx` continua com o `git log` inteiro.

O histórico com os segredos **vem junto** — por isso a rotação de chaves do item 2.1
é obrigatória, não opcional. A alternativa seria reescrever o histórico e perder a
rastreabilidade de todo o trabalho até aqui, o que me parece pior.

### Repositórios antigos

Arquivados no GitHub — leitura preservada, escrita bloqueada, nada apagado.
Reversível a qualquer momento.

---

## 6. A limpeza, item a item

| # | O que | Onde | Por quê |
|---|---|---|---|
| 1 | 9 arquivos `.env.bak-*` | backend | segredos versionados |
| 2 | `backups/users_deleted_2026-04-29.csv` | backend | dado pessoal versionado |
| 3 | 11 arquivos `.bak` de código | backend | `schema.prisma.bak`, `billing.service.js.bak`, etc. — o Git já é o backup |
| 4 | 7 pastas `dist.bak-*` | frontend, servidor | ~10 MB de builds antigos |
| 5 | `dist/` do versionamento | frontend | 12 MB de artefato gerado; muda o deploy para buildar no servidor |
| 6 | `dist/platforms/IMG_0523.HEIC` | frontend | HEIC não abre em navegador |
| 7 | `src/pages/Plans.tsx.bak-2026-04-29` | frontend, servidor | superado |
| 8 | `.gitignore` unificado | ambos | impedir que volte a acontecer |

> O item 5 muda o processo de publicação: hoje o `checkout` já publica porque o
> `dist/` é versionado. Sem ele, o deploy passa a exigir `npm run build` no
> servidor. É o correto, mas é uma mudança de rotina — e foi justamente o `dist/`
> versionado que permitiu o deploy de hoje funcionar mesmo sem build.

---

## 7. Ordem de execução proposta

**Agora, independente do monorepo — são correções de produção:**

1. Rotacionar `STRIPE_SECRET_KEY`, `JWT_SECRET`, `FACECHECK_API_KEY`, `APIFY_TOKEN`,
   `GOOGLE_API_KEY`, `BRAVE_API_KEY`, `TRUECALLER_API_KEY` e a senha do banco
   > rotacionar o `JWT_SECRET` desconecta todos os usuários — com 4 cadastrados,
   > o custo é praticamente zero. É a melhor janela que vocês vão ter.
2. Corrigir o furo do boleto (item 2.3)
3. Fazer `/scan/self` debitar crédito (item 2.5)

**Depois, o monorepo:**

4. Criar `AuraDUE/18check`, importar os dois com histórico
5. Executar a limpeza da seção 6
6. Ajustar `deploy.sh`, `nginx` e caminhos do servidor
7. Migrar o servidor para o novo repositório
8. Arquivar os repositórios antigos

**Quando você decidir, sobre preço:**

9. Moeda única em real, tabela da seção 3
10. Criar os `STRIPE_PRICE_PACK*` no Stripe e no `.env`, ou remover os pacotes da
    tela até que existam
