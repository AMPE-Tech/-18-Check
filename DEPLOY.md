# Guia de Servidor e Deploy — [18+]Check

Guia para quem nunca mexeu com servidor. Servidor: **Hetzner, Ubuntu, `ubuntu-4gb-nbg1-3`** (Nuremberg, Alemanha).

---

## 0. RESOLVER AGORA: o `git fetch` pedindo usuário e senha

Foi isso que aconteceu no seu terminal:

```
root@ubuntu-4gb-nbg1-3:/var/www/18check-backend# git fetch origin
Username for 'https://github.com':
Password for 'https://...@github.com':
```

**Por que:** o repositório no servidor está configurado com endereço `https://github.com/...`.
Nesse formato o Git pede login. E o GitHub **não aceita mais senha de conta desde
agosto de 2021** — mesmo digitando a senha certa, ia falhar.

**O que deu errado além disso:** no lugar do usuário, foi colado o comando
`git checkout claude/update-check-landing-files-lwjwgz`. O Git tratou aquilo como
se fosse um nome de usuário. Depois a conexão SSH caiu (`client_loop: send disconnect`).

### A correção — chave SSH de deploy (5 minutos, não expira)

**1)** Reconecte no servidor e gere uma chave:

```bash
ssh-keygen -t ed25519 -C "servidor-hetzner-18check" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

A última linha imprime algo como `ssh-ed25519 AAAAC3Nza... servidor-hetzner-18check`.
**Copie essa linha inteira.**

**2)** No GitHub, no repositório do backend:
`Settings` → `Deploy keys` → `Add deploy key`
- Title: `servidor hetzner`
- Key: cole a linha copiada
- **Não** marque "Allow write access" (o servidor só precisa ler)
- `Add key`

**3)** De volta no servidor, troque o endereço de HTTPS para SSH:

```bash
cd /var/www/18check-backend
git remote -v                      # veja o endereço atual
git remote set-url origin git@github.com:AuraDUE/18check-backend.git
ssh -T git@github.com              # teste — responde "Hi ...! You've successfully authenticated"
git fetch origin                   # agora funciona sem pedir senha
```

> Ajuste `AuraDUE/18check-backend.git` para o nome real que aparecer no `git remote -v`.

**4)** Só então troque de branch:

```bash
git checkout claude/update-check-landing-files-lwjwgz
```

### Se a conexão SSH cair sozinha

No **seu PC** (Windows), crie/edite `C:\Users\<seu-usuário>\.ssh\config`:

```
Host 18check
    HostName SEU.IP.DO.SERVIDOR
    User root
    ServerAliveInterval 30
    ServerAliveCountMax 6
```

Depois basta `ssh 18check`. O `ServerAliveInterval` manda um "oi" a cada 30s e
evita que a conexão morra por inatividade.

**Dica que salva trabalho:** use `tmux` no servidor. Se a conexão cair, o comando
continua rodando e você volta pra ele.

```bash
apt install -y tmux
tmux new -s deploy      # cria a sessão
# (conexão caiu? reconecte e rode:)
tmux attach -t deploy
```

---

## 1. ATENÇÃO — o site no ar está DIFERENTE do repositório

Isto é o mais importante deste guia. **Não rode `git pull` + `npm run build` no
frontend antes de ler.**

Comparei o JavaScript que está publicado em `https://18check.online` com o que o
repositório gera hoje:

| | No ar agora | No repositório (branch `main`) |
|---|---|---|
| Arquivo | `index-BeJZ0wsI.js` | `index-BEHwYhUD.js` |
| Tamanho | 795.932 bytes | 783.393 bytes |
| Preços | `R$ 49,90`, **`R$ 17,10`**, **`R$ 67`** | `R$ 49,90`, `$24.90`, `$74.10`, `$9.90`, `$19.10` |
| Publicado em | 30/04/2026 | último commit: 29/04/2026 |

Os valores **R$ 17,10** e **R$ 67** existem no site no ar e **não existem em lugar
nenhum do repositório**. Ou seja: alguém editou e compilou direto no servidor,
depois do último commit, e essas mudanças nunca voltaram para o GitHub.

**Consequência:** se você rodar `git pull && npm run build` na pasta do frontend
agora, o site no ar volta para a versão de 29/04 e **os preços atuais somem**.

### Antes de qualquer deploy do frontend — recuperar o que está no servidor

```bash
cd /var/www/18check-frontend      # confirme o caminho real (seção 2)

# O que foi alterado e nunca foi commitado?
git status
git diff > /root/mudancas-servidor-$(date +%F).patch
```

Olhe o `git status`. Se aparecerem arquivos modificados, essas são as alterações
de 30/04. Guarde o `.patch` gerado — ele é o seu seguro. Depois decida com o
Marcos se essas mudanças entram no repositório (commit + push) ou se são descartadas.

Se o `git status` vier **limpo**, significa que o build no ar foi gerado a partir de
código que nem chegou a ser salvo na pasta — nesse caso o backup do `dist/` publicado
é a única cópia:

```bash
cp -a /var/www/18check.online /root/backup-site-no-ar-$(date +%F)
```

---

## 2. Entendendo o seu servidor

Você tem **um servidor** rodando **três coisas**:

```
                      Internet
                          │
                    ┌─────▼─────┐
                    │   nginx   │  ← porta 80/443, cuida do HTTPS
                    └─────┬─────┘
              ┌───────────┴───────────┐
              │                       │
     18check.online          api.18check.online
     (arquivos estáticos)    (repassa p/ Node na porta 3000)
              │                       │
    /var/www/18check.online   /var/www/18check-backend
       (build do React)          (Node + Express)
```

### Descobrir os caminhos reais

Nunca chute caminho de pasta. Descubra:

```bash
# Qual pasta o nginx serve para cada site?
grep -r "root\s" /etc/nginx/sites-enabled/

# Quais sites estão ativos?
ls -l /etc/nginx/sites-enabled/

# O backend está rodando? (procure por node/pm2)
systemctl list-units --type=service --state=running | grep -i "node\|18check\|pm2"
pm2 list 2>/dev/null

# Em que porta o Node escuta?
ss -tlnp | grep node
```

### Estado atual verificado (27/07/2026)

Testei de fora e está tudo funcionando:

- `http://18check.online` → redireciona 301 para HTTPS ✅
- `https://18check.online` → 200, nginx 1.24.0 (Ubuntu) ✅
- `https://www.18check.online` → 200 ✅
- `https://18check.online/login` → 200 (rota do React funciona ao recarregar) ✅
- Assets com cache de 1 ano `public, immutable` ✅
- `https://api.18check.online/health` → 200 ✅
- `GET /api/user/me` sem token → 401 ✅ (proteção funcionando)
- `POST /api/auth/login` com senha errada → 401 `{"success":false,"error":"Credenciais inválidas"}` ✅
- Cabeçalhos de segurança (Helmet) presentes na API ✅

**Nada disso precisa ser refeito.** O servidor está configurado corretamente.

---

## 3. Como fazer deploy do frontend

Depois de resolver a seção 1, o processo vira um comando só.

```bash
cd /var/www/18check-frontend        # ajuste ao caminho real

# 1. Simule primeiro — não altera nada, só mostra o que faria
./deploy/deploy.sh --dry-run

# 2. Rode de verdade
WEB_ROOT=/var/www/18check.online ./deploy/deploy.sh
```

O script faz, nesta ordem:
1. Confere se `node` e `npm` existem
2. **Avisa se houver alterações não commitadas** (e pede confirmação antes de sobrescrever)
3. `git pull` da branch `main`
4. `npm ci`
5. `npm run build` — se o build falhar, **para aqui e não publica nada**
6. **Backup** do site atual em `/var/backups/18check/<data-hora>/`
7. Copia o `dist/` para a pasta do nginx

### Deu errado? Volte atrás

```bash
./deploy/rollback.sh
```

Ele lista os backups, você escolhe o número, confirma com `SIM`. Antes de restaurar
ele ainda salva o estado atual — então dá pra desfazer o rollback também.

### "Fiz o deploy mas continuo vendo o site antigo"

Não é o servidor. É cache do navegador **ou o service worker** (`public/sw.js`,
o arquivo que faz o site funcionar offline). Para conferir de verdade:

1. Abra uma aba anônima, ou
2. `Ctrl + Shift + R` (recarrega ignorando cache), ou
3. F12 → aba `Application` → `Service Workers` → `Unregister` → recarregue

Para confirmar pelo terminal qual versão está publicada:

```bash
curl -s https://18check.online | grep -o 'index-[A-Za-z0-9_-]*\.js'
```

Compare com o nome do arquivo em `dist/assets/` depois do build. Se forem iguais,
o deploy funcionou e o problema é cache do seu navegador.

---

## 4. Deploy do backend

O backend é outro repositório (`/var/www/18check-backend`) e **não faz parte deste
projeto** — não consigo vê-lo daqui. O padrão costuma ser:

```bash
cd /var/www/18check-backend
git pull origin main
npm ci
npm run build            # se for TypeScript
pm2 restart 18check-api  # ou: systemctl restart <nome-do-serviço>
pm2 logs 18check-api     # acompanhe os logs — Ctrl+C para sair
```

Descubra o nome real do processo com `pm2 list` ou `systemctl list-units | grep 18check`.

### Sobre o `.env` que você estava editando

Você estava mexendo em `/var/www/18check-backend/.env`:

```
LIVENESS_PROVIDER=aws
AWS_REGION=sa-east-1
AWS_LIVENESS_ROLE_ARN=arn:aws:iam::183537898565:role/18check-liveness
```

Três avisos:

1. **O `.env` NUNCA pode ir para o GitHub.** Confirme que ele está ignorado:
   ```bash
   cd /var/www/18check-backend
   git check-ignore -v .env      # tem que responder algo; se não responder, ele NÃO está ignorado
   ```
   Se não estiver, adicione `.env` ao `.gitignore` **antes** de qualquer commit.

2. **Faça backup do `.env`.** Ele não está no git, então se o servidor for perdido,
   ele se perde junto:
   ```bash
   cp /var/www/18check-backend/.env /root/env-backup-$(date +%F)
   ```
   Guarde uma cópia fora do servidor também (gerenciador de senhas, não email).

3. **Depois de editar o `.env`, o Node precisa reiniciar** para ler os valores novos.
   Editar o arquivo sozinho não muda nada no que está rodando.

---

## 5. Manutenção básica

### Certificado HTTPS (Let's Encrypt)

Vence a cada 90 dias, mas o certbot renova sozinho. Confirme:

```bash
systemctl status certbot.timer     # deve estar "active (waiting)"
certbot certificates               # mostra a data de validade
certbot renew --dry-run            # simula a renovação
```

### Firewall

```bash
ufw status
```

Deve permitir apenas `22` (SSH), `80` e `443`. Se estiver `inactive`:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

> Libere o `OpenSSH` **antes** de dar `ufw enable`, senão você se tranca do lado de fora.

### Atualizações do sistema

O login mostrou `22 updates` e `*** System restart required ***`.

```bash
apt update && apt upgrade -y
reboot                              # o site fica fora ~1 minuto
```

Faça isso num horário de pouco movimento. Depois do reboot, confirme:

```bash
systemctl status nginx
pm2 list
curl -sI https://18check.online | head -1
```

### Espaço em disco

```bash
df -h /
du -sh /var/backups/18check/*
```

Se encher, apague backups antigos — o `deploy.sh` já mantém só os 5 mais recentes.

### Ver o que está errado quando algo quebra

```bash
tail -50 /var/log/nginx/error.log        # erro no nginx
nginx -t                                 # testa a configuração
journalctl -u nginx -n 50                # log do serviço
pm2 logs --lines 50                      # log do backend
```

---

## 6. Regras do projeto

O `CLAUDE.md` deste repositório está com **blindagem**: nenhuma alteração em preços,
fontes, cores, imagens ou dependências sem autorização expressa do Marcos Costa.

Os arquivos deste guia (`DEPLOY.md`, `deploy/`) são **apenas infraestrutura de
publicação** — não tocam em nenhum arquivo de design, em `src/` nem no `package.json`.

⚠️ **Observação:** o `CLAUDE.md` diz "Moeda: USD global", mas o commit `74ee376`
(29/04/2026) migrou os planos para BRL `R$ 49,90`, e o site no ar usa `R$ 17,10`
e `R$ 67`. Os três estão em desacordo. Vale alinhar com o Marcos qual é o valor correto.
