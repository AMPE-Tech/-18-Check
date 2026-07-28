# BLINDAGEM FRONTEND — [18+]Check

> **BLINDADO em 16/04/2026 por Marcos Costa**
> **NENHUMA ALTERAÇÃO SEM AUTORIZAÇÃO EXPRESSA DO PROPRIETÁRIO**

## Regras para TODOS os agentes de IA

1. NÃO editar nenhum arquivo sem 3 confirmações de Marcos
2. NÃO fazer commit ou push sem aprovação
3. NÃO alterar preços, fontes, cores ou imagens
4. NÃO adicionar dependências
5. NÃO alterar o design system (Playfair Display, gold #D4AF5F, dark #0C0C0E)

## Stack blindada
- React 19 + TypeScript + Vite 8 + Tailwind 4
- Font: Playfair Display (display) + DM Sans (body)
- Moeda: **BRL** em todo o produto — atualizado em 27/04/2026 e unificado em
  27/07/2026. O produto é exclusivamente brasileiro: i18n só em português,
  identidade por CPF, Pix no checkout. A linha anterior dizia "USD global" e
  ficou obsoleta; corrigida para que ninguém reverta a unificação por engano.
- Idioma: português, único carregado. Os outros 11 locales descrevem o produto
  anterior — não religar sem traduzir. Motivo em `src/i18n/index.ts`.
- Deploy: Hetzner via git pull + npm run build

## Antes de mexer, leia
- `README.md` — o que é, como rodar, como publicar
- `docs/CONTEXTO.md` — **por que** o produto é assim, e as armadilhas que não
  são óbvias no código. Evita retrabalho e evita desfazer decisão deliberada.

## Regra de produto que não se afrouxa
Nenhuma resposta deste sistema identifica a pessoa retratada numa foto enviada
pelo usuário. Devolvemos sinal de reúso e de denúncia — nunca quem é o rosto.
Em golpe romântico esse rosto costuma ser de outra vítima, que também teve a
imagem roubada; identificá-la criaria uma segunda vítima. A regra está escrita
no topo de `src/pages/PhotoCheck.tsx` e do `suspect.service.js` no backend.

## Proprietário
Marcos Costa — nml.costa@gmail.com — AuraTECH
