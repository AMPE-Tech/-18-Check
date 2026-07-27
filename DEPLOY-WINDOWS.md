# Roteiro pelo PowerShell — do Windows até o servidor

Guia para quem opera do Windows. O PowerShell é o terminal; os comandos rodam no
Linux do servidor. A divisão abaixo é sempre a mesma:

- 🪟 **No PowerShell** — roda no seu PC
- 🐧 **No servidor** — você cola depois de conectar

---

## Antes de tudo: duas chaves diferentes

A confusão mais comum. São duas, e servem para coisas distintas:

| | De onde → para onde | Situação |
|---|---|---|
| **Chave 1** | Seu PC → Servidor | Você já tem — é assim que você entra |
| **Chave 2** | **Servidor → GitHub** | **É a que falta.** Destrava o `git pull` |

A chave 2 nasce **dentro do servidor**. Gerar ela no Windows não resolve nada.

---

## Passo 1 — 🪟 Conectar sem a conexão cair

Sua conexão caiu no meio do trabalho (`client_loop: send disconnect`). Resolve com um
atalho fixo. No PowerShell:

```powershell
# Cria a pasta .ssh se não existir
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null

# Abre o arquivo de configuração no Bloco de Notas
notepad "$env:USERPROFILE\.ssh\config"
```

Cole isto no Bloco de Notas, **trocando pelo IP do seu servidor**, e salve:

```
Host 18check
    HostName SEU.IP.AQUI
    User root
    ServerAliveInterval 30
    ServerAliveCountMax 6
```

> Não sabe o IP? Está no painel da Hetzner, em **Servers → ubuntu-4gb-nbg1-3**.

A partir de agora, conectar é só:

```powershell
ssh 18check
```

O `ServerAliveInterval` manda um sinal a cada 30 s e impede que a conexão morra parada.

---

## Passo 2 — 🐧 Proteger o trabalho contra queda de conexão

Já conectado, antes de qualquer coisa:

```bash
apt install -y tmux
tmux new -s deploy
```

Você continua no mesmo lugar, só que agora **dentro de uma sessão que sobrevive**. Se a
conexão cair no meio de uma migração, o comando continua rodando. Para voltar:

```powershell
ssh 18check
```

```bash
tmux attach -t deploy
```

Isso não é frescura: uma migração interrompida no meio é o pior cenário deste roteiro.

---

## Passo 3 — 🐧 A chave do servidor para o GitHub

Ainda no servidor:

```bash
ssh-keygen -t ed25519 -C "servidor-hetzner-18check" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

A última linha imprime algo assim:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... servidor-hetzner-18check
```

**Selecione essa linha inteira e copie** (no PowerShell, basta selecionar com o mouse —
a cópia é automática; colar é botão direito).

Agora no navegador, em **cada** um dos dois repositórios:

`github.com/AuraDUE/18check-backend` → **Settings** → **Deploy keys** → **Add deploy key**

- **Title:** `servidor hetzner`
- **Key:** cole a linha
- **Allow write access:** deixe **desmarcado** (o servidor só precisa ler)
- **Add key**

Repita em `github.com/AuraDUE/-18-Check`.

> Uma chave só pode ser deploy key de **um** repositório por vez no GitHub. Se o segundo
> reclamar que a chave já está em uso, use **Settings do seu usuário → SSH and GPG keys**
> em vez de Deploy keys — aí ela vale para todos os seus repositórios.

### 🐧 Trocar o endereço de HTTPS para SSH

É isto que faz o `git` parar de pedir senha:

```bash
cd /var/www/18check-backend
git remote -v
git remote set-url origin git@github.com:AuraDUE/18check-backend.git
ssh -T git@github.com
```

O `ssh -T` vai perguntar `Are you sure you want to continue connecting?` — responda
`yes`. A resposta boa é:

```
Hi AuraDUE/18check-backend! You've successfully authenticated, but GitHub does not provide shell access.
```

A parte do "does not provide shell access" é **normal**, não é erro.

```bash
git fetch origin
```

Se rodar sem pedir nada, está resolvido. Repita na pasta do frontend, trocando o nome do
repositório.

> **Se ainda aparecer `Username for 'https://github.com'`:** pressione `Ctrl + C`. Esse
> prompt significa que o remote continua em HTTPS — o `set-url` acima não pegou. Rode
> `git remote -v` e confira se começa com `git@github.com:`. Nunca digite comando dentro
> desse prompt: ele trata o que você escrever como nome de usuário.

---

## Passo 4 — 🐧 Backup do banco

**Esta é a única etapa irreversível do roteiro.** Não pule.

```bash
cd /var/www/18check-backend
pg_dump "$(grep ^DATABASE_URL .env | cut -d= -f2- | tr -d '"')" > /root/backup-db-$(date +%F-%H%M).sql
ls -lh /root/backup-db-*.sql
```

Olhe o tamanho na saída do `ls`. Se estiver **0** ou poucos bytes, o backup falhou —
**pare aqui** e não siga para a migração.

Guarde uma cópia fora do servidor. 🪟 No PowerShell, numa janela nova:

```powershell
scp 18check:/root/backup-db-*.sql "$env:USERPROFILE\Desktop\"
```

---

## Passo 5 — 🐧 Migração e deploy do backend

```bash
cd /var/www/18check-backend
git pull origin claude/18check-landing-page-setup-wssq65
npx prisma migrate deploy
npx prisma generate
pm2 restart 18check-api
pm2 logs 18check-api --lines 30
```

O `pm2 logs` fica aberto mostrando os logs — saia com `Ctrl + C` (isso encerra só a
visualização, não o serviço).

A migração aplicada é `20260727130000_suspect_scan_and_scam_signals`. Ela cria duas
tabelas novas e **não altera nenhuma existente** — nada de dado atual é tocado. A cadeia
inteira foi testada num banco limpo antes de chegar aqui.

Se o Prisma parar com erro, ele para **antes** de aplicar pela metade (cada migração roda
em transação). O banco fica como estava, e o backup do passo 4 é a saída definitiva.

---

## Passo 6 — 🐧 Deploy do frontend

```bash
cd /var/www/18check-frontend        # confirme o caminho com: grep -r "root " /etc/nginx/sites-enabled/
git pull origin claude/18check-landing-page-setup-wssq65

BRANCH=claude/18check-landing-page-setup-wssq65 ./deploy/deploy.sh --dry-run
```

Leia o que o `--dry-run` mostrou. Se estiver certo, rode de verdade:

```bash
BRANCH=claude/18check-landing-page-setup-wssq65 WEB_ROOT=/var/www/18check.online ./deploy/deploy.sh
```

O script faz backup do site antes de publicar e para sem publicar se o build falhar.
Para desfazer: `./deploy/rollback.sh`.

---

## Passo 7 — 🪟 Conferir do seu PC

Volte ao PowerShell (pode ser numa janela nova, sem sair do servidor):

```powershell
# A API subiu com a rota nova? 401 = certo. 404 = a branch não foi puxada.
curl.exe -s -o NUL -w "scan/suspect -> %{http_code}`n" https://api.18check.online/api/scan/suspect

# O site está no ar?
curl.exe -s -o NUL -w "site -> %{http_code}`n" https://18check.online

# Qual versão do JS está publicada?
curl.exe -s https://18check.online | Select-String -Pattern "index-[A-Za-z0-9_-]+\.js"
```

> Use `curl.exe` com o `.exe` no fim. No PowerShell, `curl` sozinho é um apelido para
> outro comando e não aceita esses parâmetros.

**Resultado esperado:** `scan/suspect -> 401` e `site -> 200`.

Depois abra `https://18check.online` numa **aba anônima** (`Ctrl + Shift + N`). Sem isso
você provavelmente verá a versão antiga, guardada pelo cache e pelo service worker — o
servidor está certo, quem está velho é o navegador.

---

## Se algo quebrar

🐧 No servidor:

```bash
pm2 logs 18check-api --lines 50     # erro do backend
tail -50 /var/log/nginx/error.log   # erro do nginx
nginx -t                            # testa a configuração do nginx
pm2 list                            # o serviço está de pé?
systemctl status nginx
```

Restaurar o banco a partir do backup (só se a migração tiver dado errado):

```bash
psql "$(grep ^DATABASE_URL .env | cut -d= -f2- | tr -d '"')" < /root/backup-db-XXXX.sql
```

Voltar o site para a versão anterior:

```bash
cd /var/www/18check-frontend && ./deploy/rollback.sh
```

---

## Uma coisa que vale saber

Você vai ver na internet gente rodando comandos remotos direto do PowerShell, assim:

```powershell
ssh 18check "cd /var/www/18check-backend && git pull"
```

Funciona para comandos simples. Mas quando o comando tem `$`, aspas ou parênteses — como
o `pg_dump` do passo 4 — o PowerShell interpreta esses símbolos **antes** de mandar, e o
resultado chega errado do outro lado. É uma fonte de erro difícil de enxergar.

Por isso este roteiro é sempre: **conecta com `ssh 18check`, e cola os blocos Linux lá
dentro.** Mais previsível, e você vê a saída de cada passo.
