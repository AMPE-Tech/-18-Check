# Contrato — checagem de contato suspeito

O que o frontend (`src/pages/PhotoCheck.tsx`, rota `/app/checar-contato`) troca com o
backend.

**Estado: implementado** em `AuraDUE/18check-backend`, branch
`claude/18check-landing-page-setup-wssq65` — `src/modules/scan/suspect.service.js` e
`src/modules/scan/signals.js`. A busca reversa entra pelo `facial.engine` que já
existia (FaceCheck), com o mesmo guard de orçamento e cache por sha. Falta rodar a
migração `20260727130000_suspect_scan_and_scam_signals` no servidor.

O par de endpoints segue o mesmo formato de `/scan/self`: um POST que abre a checagem
e devolve um `scanId`, e um GET que o frontend consulta a cada 3 s até sair de
`processing` (60 tentativas, ~3 min de teto).

---

## Regras que o backend precisa respeitar

Estas não são preferências de implementação — são o que separa este produto da busca
de terceiros que ele deixou de fazer.

1. **Nunca identificar a pessoa retratada na foto.** A resposta diz se a *imagem* é
   reaproveitada, não quem é o rosto. Em golpe romântico o rosto é quase sempre de uma
   vítima que também teve a imagem roubada — devolver a identidade dela criaria uma
   segunda vítima. Nenhum campo da resposta deve carregar nome, documento ou perfil da
   pessoa retratada.
2. **Não abrir, raspar ou logar no perfil informado.** O `@` e o telefone são
   consultados **em bases de denúncia**. Raspar perfil viola os termos das redes e
   recairia no mesmo problema do item 1.
3. **Os `alias` retornados são os nomes sob os quais a foto é usada** — apelidos de
   golpista, que é justamente a evidência de reúso. Não confundir com identidade.
4. **`clean` nunca significa "seguro".** O frontend já trata isso no texto, mas o
   backend não deve inferir confiabilidade a partir da ausência de resultado.

---

## `POST /api/scan/suspect`

`Content-Type: multipart/form-data`

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `photo` | File | não | JPG, PNG ou WEBP, até 10 MB (o frontend já valida) |
| `platform` | string | não | `Tinder`, `Instagram`, `Facebook`, `TikTok`, `LinkedIn`, `Telegram`, `Badoo`, `Outro` |
| `handle` | string | não | `@perfil` ou URL do perfil |
| `name` | string | não | nome que a pessoa usa — quase sempre falso, serve para cruzar com os `alias` sob os quais a foto circula |
| `phone` | string | não | WhatsApp/telefone, com ou sem máscara |
| `movedOut` | `"true"` | não | a pessoa pediu para sair do app e seguir no WhatsApp |

**Pelo menos um de `photo`, `handle`, `name` ou `phone` vem preenchido** — o frontend
não deixa enviar vazio, mas valide no servidor também.

### Por que cada campo importa

O fluxo do golpe é sempre o mesmo: começa no Tinder ou Instagram e migra para o
WhatsApp. A vítima fica com **rede social falsa, imagens falsas, nome falso — e um
telefone real, porém provisório**.

O telefone é o único identificador verdadeiro do conjunto, e é o que tem prazo mais
curto: o número funciona durante o golpe e é descartado depois. Trate `phone` como o
identificador de maior valor enquanto está vivo, e registre a data em que foi visto.

`movedOut` é sinal de comportamento, não de dado. Vale por si só — o frontend o exibe
mesmo quando o veredito da imagem volta `clean`, que é justamente o caso em que a
checagem técnica não tem o que dizer.

Deve consumir 1 crédito do usuário (o frontend chama `refreshUser()` depois e espera o
saldo atualizado).

**Resposta 200**

```json
{ "success": true, "data": { "scanId": "sus_01H..." } }
```

**Erros** — mesma forma do resto da API (`utils/response.js`), com o texto em `error`:

```json
{ "success": false, "error": "Créditos insuficientes" }
```

`413` também precisa devolver JSON. O nginx da API já está com
`client_max_body_size 12M` (veja `deploy/nginx/api.18check.online.conf`).

---

## `GET /api/scan/suspect/:scanId`

**Resposta 200**

```json
{
  "success": true,
  "data": {
    "status": "done",
    "verdict": "reused",
    "profileCount": 14,
    "aliasCount": 9,
    "reportCount": 2,
    "appearances": [
      {
        "platform": "Instagram",
        "alias": "Michael Ross",
        "url": "https://...",
        "firstSeen": "2025-11-02T00:00:00Z"
      }
    ],
    "stockSource": null,
    "handleReportCount": 3,
    "handleReports": [
      { "source": "ScamAdviser", "reference": "#48211", "date": "2026-02-14T00:00:00Z" }
    ],
    "scannedAt": "2026-07-27T12:40:00Z"
  }
}
```

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `status` | `processing` \| `done` \| `failed` | enquanto for `processing`, o frontend continua consultando |
| `verdict` | ver tabela abaixo | só em `done` |
| `profileCount` | number | em quantos perfis a foto aparece |
| `aliasCount` | number | sob quantos nomes diferentes |
| `reportCount` | number | denúncias ligadas à **foto** |
| `appearances[]` | array | onde a foto aparece; `alias` e `url` opcionais |
| `stockSource` | string \| null | nome do banco de imagens, quando for o caso |
| `handleReportCount` | number | denúncias ligadas ao **`@`/telefone** |
| `handleReports[]` | array | `source` obrigatório; `reference` e `date` opcionais |
| `scannedAt` | ISO 8601 | exibido como data pt-BR |
| `reason` | string | motivo, quando `status: "failed"` |

Campos ausentes são tolerados: o frontend esconde o bloco correspondente. `status:
"failed"` com `reason` é renderizado como mensagem, sem quebrar a tela.

### Vereditos

| Valor | Quando | Como o frontend mostra |
|---|---|---|
| `reported` | a foto consta em base de denúncia | vermelho — "já foi denunciada em golpes" |
| `reused` | mesma foto em vários perfis, sob nomes diferentes | vermelho — "aparece em vários perfis" |
| `stock` | imagem de banco de imagens | amarelo — "é de banco de imagens" |
| `clean` | nada encontrado | cinza + alerta reforçando que **não** é atestado de idoneidade |
| `inconclusive` | não deu para comparar (qualidade, corte, tamanho) | cinza — sugere reenviar |

Quando só vier `handle`/`phone` (sem foto), use `inconclusive` no `verdict` e preencha
`handleReports` — o bloco de denúncias do contato é renderizado independente do veredito
da foto, então a informação chega ao usuário do mesmo jeito.

---

## A prova tem prazo — capture no momento da checagem

Este é o requisito mais importante do backend, e não aparece na forma da resposta.

O perfil, as fotos e o número **ficam no ar apenas até o golpe se completar**. Depois o
golpista apaga tudo e recomeça com perfil novo. Quem está checando está dentro da janela
em que a prova ainda existe — e essa janela não volta.

Portanto, no momento em que a checagem roda, **persista o que foi encontrado**, não
apenas os números agregados:

- URL de cada `appearance`, mais uma cópia do que estava lá (imagem e nome exibido)
- o `alias` visto em cada perfil, com data
- `handle`, `name` e `phone` informados, com data
- hash perceptual da foto enviada

Sem isso, o registro no histórico do usuário aponta para links que já morreram, e ele
perde exatamente o anexo de que precisa para boletim de ocorrência, contestação bancária
e denúncia à plataforma. O frontend já apresenta o resultado ao usuário como registro
datado — o backend precisa sustentar essa promessa.

## Realimentação da base

O ciclo se repete: apagam, recriam e começam de novo — com fotos que costumam ser as
mesmas e, por um tempo, o mesmo número.

Cada checagem enviada por um usuário deveria alimentar a base que atende o próximo:
foto (por hash), `handle`, `name` e `phone`, com data de observação. É o que faz o
`verdict` sair de `clean` para `reused` na segunda vez que aquela foto aparece, e é o
que transforma a ferramenta em algo que melhora sozinho conforme é usada.

Cuidado ao fazer isso: guarde sinal de reúso e denúncia, nunca identidade da pessoa
retratada (regra 1). O que entra na base é "esta imagem circulou sob estes nomes",
não "esta imagem é de fulano".

## Retenção

A foto enviada é de terceiro e não tem consentimento dele. Recomendação: processar,
guardar apenas o hash perceptual necessário para o histórico, e descartar o arquivo
original. Se for retido, precisa estar declarado na Política de Privacidade
(`src/pages/Privacy.tsx`) antes de entrar no ar.
