# Contexto do projeto — [18+]Check

Este documento existe para quem vai mexer no código e não estava aqui quando as
decisões foram tomadas. Ele explica **por quê**, não **o quê** — o que o código
faz está no código.

Última revisão: 27/07/2026.

---

## 1. O produto mudou de direção, e isso explica quase tudo

### Como era

Até abril de 2026, o [18+]Check buscava **a imagem de outra pessoa**. A promessa
era descobrir se o seu parceiro tinha perfis em plataformas adultas — o título
da página era literalmente *"Descubra se seu parceiro é do Job"*. Você informava
nome, telefone e redes de um terceiro, e o sistema procurava o rosto dele.

### Como é

Hoje o usuário **prova que é ele mesmo** — identidade por CPF contra a base
oficial e prova de vida por captura ao vivo — e busca **a própria imagem**.

### Por que mudou

Buscar e tratar dado biométrico de terceiro sem consentimento é exposição
jurídica séria sob a LGPD. Não é uma tecnicalidade: é o tipo de coisa que fecha
uma empresa. Verificar a própria imagem, com consentimento explícito e opção de
revogar a referência facial, é outro produto — e é defensável.

**Consequências que você vai encontrar espalhadas pelo código:**

- `/scan/self` não aceita parâmetro de imagem. O rosto vem sempre do template da
  sessão verificada, do lado do servidor. É de propósito: sem parâmetro, não há
  como pesquisar o rosto de outra pessoa.
- As páginas `/privacidade` e `/termos` existem por causa disso.
- A tela `/app/conta` permite revogar a referência facial.
- Os 11 arquivos de tradução fora do português continuam no repositório mas
  **não são carregados**. Eles descrevem o produto anterior. Religar sem
  traduzir faria um visitante estrangeiro cair no conteúdo antigo. O aviso está
  em `src/i18n/index.ts`.

### O que sobreviveu da direção antiga, e por quê

A checagem de golpe romântico continua — mas reformulada. Em `/app/checar-contato`
o usuário envia a foto que **recebeu** de alguém, e a resposta é sobre **a
imagem ser reaproveitada**, nunca sobre quem é o rosto. A distinção não é
retórica: numa foto de golpe romântico o rosto quase sempre é de outra vítima,
que também teve a imagem roubada. Identificá-la criaria uma segunda vítima.

Essa regra está escrita no topo de `src/pages/PhotoCheck.tsx` e de
`src/modules/scan/suspect.service.js`, nos dois repositórios. **Não a afrouxe.**

---

## 2. Armadilhas que não são óbvias

### O servidor hospeda outros sete projetos

Além do 18check, rodam na mesma máquina `auracarbo`, `auralo-crm`, `auratg-gate`,
`auralegal`, `auratg-demo`, `auraaudit` e `auraloa`. Quatro aplicações no pm2.

**Nunca** `pm2 restart all`, `pm2 delete all` ou `pm2 kill`. Sempre pelo nome:
`pm2 restart 18check-backend`.

### O `dist/` é versionado, e o nginx serve ele direto

O nginx aponta para `/var/www/18check-frontend/dist` — a própria pasta do
repositório. Duas consequências:

1. **`git checkout` publica o site.** Trocar de branch muda o que está no ar na
   hora, antes de qualquer build.
2. O `deploy.sh` faz **backup antes** do build, não depois. Se fosse depois,
   salvaria a versão nova em vez da antiga.

Tirar o `dist/` do versionamento é o correto e está no plano — mas mudaria o
processo, porque hoje o deploy funciona mesmo se o build falhar no servidor.

### A base de sinais só acusa na segunda vez

`ScamSignal` guarda foto (por hash), @, nome e telefone normalizados. Um sinal
só vira denúncia depois de visto **mais de uma vez** — a primeira aparição é
registro, não evidência. É o que faz o veredito sair de `CLEAN` para `REPORTED`
na segunda vítima.

Se você testar com um dado novo e não vier alerta, não está quebrado.

### "Não encontramos nada" nunca significa "seguro"

O falso negativo é o erro mais caro deste produto. Alguém que lê "limpo" e
segue confiando num golpista foi prejudicado pela ferramenta.

Por isso o veredito `clean` vem sempre acompanhado do aviso de que ausência de
achado não é atestado de idoneidade. **Não remova esse aviso para melhorar a
aparência do resultado.**

### Orçamento do FaceCheck tem limite rígido

150 créditos comprados, 3 por busca, bloqueio em 40 buscas. `facecheck-budget.js`
guarda o estado em `_facecheck_state.json` e há cache por hash — a mesma foto
duas vezes não cobra.

Quando o orçamento estoura, a busca facial falha mas a checagem **não zera**:
devolve `INCONCLUSIVE` e ainda entrega o que veio da base de sinais.

### `SHOW_ONLY_SINGLE` esconde metade da tela de planos

Em `src/pages/Plans.tsx`, essa constante está `true`. Com ela ligada, só a
investigação avulsa aparece — o plano mensal e os pacotes ficam ocultos.

Antes de desligar: os pacotes exigem `STRIPE_PRICE_PACK3`, `PACK5` e `PACK10` no
`.env` do backend. Sem eles o checkout responde `"Plano invalido"`.

---

## 3. Dinheiro: a regra que não se quebra

**O crédito só sai depois que o dinheiro entra.**

Parece óbvio, mas foi violado por meses. O código creditava em
`checkout.session.completed`, e esse evento dispara quando o cliente **fecha o
checkout** — não quando paga. Com boleto, dava para gerar o boleto, receber o
crédito, rodar a busca consumindo crédito de provedor já pago, e nunca pagar.

Hoje:

- `checkout.session.completed` só credita com `payment_status === "paid"`
- `checkout.session.async_payment_succeeded` credita quando o pagamento
  assíncrono compensa
- `checkout.session.async_payment_failed` só registra

O boleto foi removido; ficaram **cartão e Pix**. O Pix também é de confirmação
assíncrona, então o mesmo par de eventos cobre os dois.

Meios de pagamento ficam em `PAYMENT_METHODS`, no `billing.service.js`.

> ⚠️ O Pix precisa estar **ativado no painel do Stripe**. Sem isso, a criação da
> sessão falha e **nem cartão funciona**, porque a lista inteira é rejeitada.

### Débito de crédito

Tanto `/scan/self` quanto `/scan/suspect` debitam **dentro da transação** que
cria a varredura. O `requireCredits` da rota só confere o saldo — sem o débito
no serviço, duas requisições simultâneas passariam as duas pela conferência e
gastariam um crédito só.

---

## 4. Incidente de segredos — leia antes de tocar no backend

Nove arquivos `.env.bak-*` estão **versionados** em `AuraDUE/18check-backend`,
com valores reais de `STRIPE_SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL` e as
chaves de FaceCheck, Apify, Google, Brave e Truecaller.

Também está versionado `backups/users_deleted_2026-04-29.csv`, com e-mail, hash
de senha e id de cliente Stripe de **usuários que pediram exclusão**.

**Estão no histórico do Git.** Apagar o arquivo hoje não desfaz. As chaves
precisam ser rotacionadas — se ainda não foram quando você ler isto, trate como
pendência aberta e não como história antiga.

O `.gitignore` do backend já cobre `.env`. O que escapou foram os `.bak`.

---

## 5. Provedores externos

| Provedor | Para quê | Estado |
|---|---|---|
| **AWS Rekognition** | prova de vida | integrado, pós-pago |
| **Serpro Datavalid** | CPF e nome contra base oficial | integrado, por consulta |
| **FaceCheck.ID** | busca facial reversa | integrado, pré-pago com limite |
| **Apify** | validação profunda | integrado |
| **Stripe** | pagamentos | integrado |
| **Google Custom Search** | — | chave existe no `.env`, **código nunca escrito** |
| **BNMP/CNJ** | mandados de prisão | planejado, falta escolher provedor de API |
| **Escavador / JusBrasil** | processos judiciais | planejado, custo mensal |

### Sobre o Datavalid

O adaptador chamava `/validate/pf-face` com corpo `{ key, answer }` — formato da
**v2**. A v4 usa `/pf-facial` e campos de topo `cpf` e `validacao`. Estava
errado e teria dado 404 em produção.

Usa-se a **v4** e não a v5 porque a v5 exige credenciamento prévio junto à
Senatran (Portaria 139/2025).

`SERPRO_DATAVALID_URL` aponta para **demonstração** por padrão. Trocar
`datavalid-demonstracao` por `datavalid` na URL é o gesto único que liga o
faturamento.

A documentação pública não expõe o corpo exato da v4. Existe `probe()` no
adaptador, que autentica e bate no `/status` sem consumir consulta — use antes
de ligar produção.

### Sobre a certidão de antecedentes da Polícia Federal

Foi avaliada e **descartada**, e vale registrar por quê para ninguém tentar de
novo: ela é emitida para o próprio titular, exige nome completo, data de
nascimento e nome da mãe do investigado — dados que num golpe romântico são
falsos — e o formulário exige declarar que se é a pessoa ou autorizado por ela.
Não tem API e tem captcha.

O **BNMP do CNJ** não tem nenhum desses problemas: é publicado justamente para
consulta pública e busca por nome ou alcunha.

---

## 6. Preço

O modelo separa **confirmar** de **documentar**, e a diferença sustenta o preço.

| | | O que entrega |
|---|---|---|
| Investigação | R$ 49,90 | a **confirmação**: o usuário sabe o que está acontecendo e consegue agir |
| Consulta oficial | + R$ 25,00 | CPF e nome na base da Receita, mandado em aberto no BNMP |
| Dossiê documentado | a definir | a **prova**: documento oficial, rastreio das alterações, relatório datado |
| Monitoramento mensal | R$ 129,00 | oculto por `SHOW_ONLY_SINGLE` |

Dizer "essa imagem é falsa" e **provar** que se trata de outra pessoa são
produtos diferentes. O primeiro resolve a decisão do usuário — cortar contato,
não transferir dinheiro. O segundo serve a boletim de ocorrência, contestação
bancária e notificação à plataforma, e consome muito mais: recuperação de
documento oficial, acompanhamento das alterações ao longo do tempo, geração de
relatório.

Por isso a investigação não desce de R$ 49,90. Baratear a entrada
desvalorizaria a confirmação, que é o produto — não um degrau para vender o
próximo.

Moeda **BRL em todo o produto**. O `CLAUDE.md` dizia "USD global" — está
desatualizado; o produto é exclusivamente brasileiro, com i18n em português,
CPF e Pix.

A única cifra em dólar que permanece é a estatística "US$ 1,3 bilhão roubados
nos EUA", que é dado internacional e está rotulado como tal.

Posicionamento, com câmbio de 5,08 em 27/07/2026: PimEyes R$ 152/mês, Social
Catfish R$ 140/mês, Meta Verified Brasil R$ 69,90/mês. Os concorrentes só vendem
assinatura — quem quer *uma* verificação não tem alternativa barata, e é aí que
a avulsa de R$ 49,90 se encaixa.

---

## 7. Pendências conhecidas

| | |
|---|---|
| 🔴 | Rotacionar as chaves expostas no histórico do Git |
| 🔴 | Ativar o Pix no painel do Stripe antes de subir o código que o exige |
| 🟠 | Credenciais do Serpro no `.env` e rodar o `probe()` |
| 🟠 | Consulta oficial de R$ 25 ainda não é cobrável: falta price no Stripe e `planType` |
| 🟡 | Monorepo `AuraDUE/18check`, com limpeza dos `.bak` e do `dist/` versionado |
| 🟡 | Escolher provedor de API do BNMP |
| 🟡 | Google Custom Search: chave paga, integração nunca escrita — usar ou remover |
| 🟡 | Servidor com 22 atualizações pendentes e reinício requerido |
| 🟡 | Backups da Hetzner desligados (~US$ 1,90/mês) |

---

## 8. Escada de investigação — desenho, ainda não construído

A ideia é entrada barata que responde o básico, e o usuário compra profundidade
conforme a dúvida evolui.

| Nível | Responde | Estado |
|---|---|---|
| 1 · entrada | Existem imagens com sua semelhança em plataformas adultas? | `/scan/self` |
| 2 | A foto que te mandaram é reaproveitada? | `/scan/suspect` |
| 3 | As imagens do Instagram/Tinder são de outra pessoa? | parcial |
| 4 | Esse número aparece em quantos perfis, e desde quando? | `ScamSignal` já guarda `firstSeen` |
| 5a | Esse CPF existe? O nome bate? | `validateRegistration` pronto |
| 5b | Há mandado em aberto? | falta provedor |

**Dois princípios do desenho:**

**"Rastro apagado" é o veredito mais forte, não o mais fraco.** Nome que não
existe, redes apagadas, imagens removidas e número desativado, juntos, são o
retrato de quem está encerrando a operação. Num sistema comum isso seria
resultado vazio; aqui é a evidência mais convincente que existe.

**A entrada não pode lucrar sendo inconclusiva.** Se a entrada é paga e pode
responder "não encontramos", o negócio ganha dinheiro sendo vago. Recomendação
registrada: entrada que não acha nada libera o nível seguinte sem cobrar.

---

## 9. Como este contexto foi levantado

Em 27/07/2026, numa sessão que começou como "finalizar a landing page". O que
apareceu no caminho: um produto que buscava biometria de terceiros sem
consentimento, segredos versionados, dados de usuários excluídos ainda no
repositório, um checkout que entregava produto antes de receber, um adaptador
com contrato de uma versão de API que não existe mais, e uma landing prestes a
ir ao ar cobrando na moeda errada.

Nada disso estava no pedido. Este documento existe para que a próxima pessoa
não precise redescobrir.
