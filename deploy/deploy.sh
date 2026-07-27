#!/usr/bin/env bash
#
# Deploy do frontend [18+]Check
# ---------------------------------------------------------------------------
# Este script roda NO SERVIDOR (Hetzner), dentro da pasta do repositório.
# Ele faz: git pull -> npm ci -> npm run build -> backup do site atual ->
# publica o novo build. Se algo der errado no meio, ele para e NÃO publica.
#
# Uso:
#   ./deploy/deploy.sh                 # deploy normal
#   ./deploy/deploy.sh --dry-run       # simula, não altera nada
#   ./deploy/deploy.sh --skip-pull     # usa o código que já está na pasta
#
# Para desfazer um deploy:  ./deploy/rollback.sh
# ---------------------------------------------------------------------------

set -euo pipefail

# --- Configuração --------------------------------------------------------
# Pasta que o nginx serve. Confirmada em /etc/nginx/sites-enabled/18check:
#   root /var/www/18check-frontend/dist;
# Se mudar, rode com: WEB_ROOT=/caminho/certo ./deploy/deploy.sh
WEB_ROOT="${WEB_ROOT:-/var/www/18check-frontend/dist}"

# Onde os backups ficam guardados
BACKUP_DIR="${BACKUP_DIR:-/var/backups/18check}"

# Quantos backups manter
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

# Branch que vai para produção
BRANCH="${BRANCH:-main}"
# -------------------------------------------------------------------------

DRY_RUN=0
SKIP_PULL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN=1 ;;
    --skip-pull) SKIP_PULL=1 ;;
    *) echo "Argumento desconhecido: $arg"; exit 1 ;;
  esac
done

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

log()  { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m  ✓ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m  ✗ %s\033[0m\n' "$*" >&2; exit 1; }

[ -f package.json ] || fail "package.json não encontrado. Rode este script de dentro do repositório."

log "1/7  Verificando ambiente"
command -v node >/dev/null || fail "node não instalado"
command -v npm  >/dev/null || fail "npm não instalado"
echo "  node $(node -v) | npm $(npm -v)"
echo "  repositório: $REPO_DIR"
echo "  publica em:  $WEB_ROOT"
[ -d "$WEB_ROOT" ] || fail "A pasta $WEB_ROOT não existe. Confira o WEB_ROOT (veja DEPLOY.md, seção 'Descobrir a pasta do site')."
ok "ambiente ok"

log "2/7  Checando alterações não commitadas"
if [ -n "$(git status --porcelain)" ]; then
  echo "  ATENÇÃO: existem arquivos modificados neste servidor que não estão no git:"
  git status --short | sed 's/^/    /'
  echo
  echo "  Se você continuar com o 'git pull', essas alterações podem ser PERDIDAS."
  echo "  Salve-as antes com:  git stash   (ou commite e dê push)"
  read -r -p "  Continuar mesmo assim? (digite SIM) " confirm
  [ "$confirm" = "SIM" ] || fail "cancelado pelo usuário"
fi
ok "verificado"

log "3/7  Atualizando código (branch $BRANCH)"
if [ "$SKIP_PULL" = "1" ]; then
  echo "  --skip-pull: pulando git pull"
elif [ "$DRY_RUN" = "1" ]; then
  echo "  [dry-run] git pull origin $BRANCH"
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi
echo "  commit atual: $(git log -1 --format='%h %s')"
ok "código atualizado"

log "4/7  Instalando dependências"
if [ "$DRY_RUN" = "1" ]; then
  echo "  [dry-run] npm ci"
else
  npm ci
fi
ok "dependências ok"

# Neste servidor o nginx serve o próprio dist/ do repositório, então o build
# escreve direto na pasta que está no ar. Duas consequências: o backup TEM de
# vir antes do build (senão salvaria a versão nova) e não existe etapa de
# cópia depois. O script detecta os dois layouts sozinho.
if [ "$(readlink -f "$WEB_ROOT")" = "$(readlink -f "$REPO_DIR/dist")" ]; then
  IN_PLACE=1
else
  IN_PLACE=0
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
log "5/7  Backup do site que está no ar"
if [ "$DRY_RUN" = "1" ]; then
  echo "  [dry-run] cp -a $WEB_ROOT $BACKUP_DIR/$STAMP"
else
  mkdir -p "$BACKUP_DIR"
  cp -a "$WEB_ROOT" "$BACKUP_DIR/$STAMP"
  echo "  backup salvo em: $BACKUP_DIR/$STAMP"
  # Remove backups antigos, mantendo os KEEP_BACKUPS mais recentes
  ls -1dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | while read -r old; do
    echo "  removendo backup antigo: $old"
    rm -rf "$old"
  done
fi
ok "backup feito"

log "6/7  Gerando build de produção"
if [ "$IN_PLACE" = "1" ]; then
  echo "  o nginx serve o próprio dist/ — o build publica direto"
fi
if [ "$DRY_RUN" = "1" ]; then
  echo "  [dry-run] npm run build"
else
  # Com o build escrevendo direto na pasta publicada, uma falha no meio pode
  # deixar o site pela metade. O 'tsc -b' roda antes e pega a maioria dos
  # erros sem tocar em nada, mas se escapar, o backup acima é a saída.
  if ! npm run build; then
    if [ "$IN_PLACE" = "1" ]; then
      printf '\n\033[1;31m  O build falhou COM a pasta publicada em uso.\033[0m\n'
      printf '  Restaure agora:  ./deploy/rollback.sh %s\n\n' "$STAMP"
    fi
    fail "build falhou — nada foi publicado a partir daqui"
  fi
  [ -f dist/index.html ] || fail "build não gerou dist/index.html"
fi
ok "build gerado"

log "7/7  Publicando"
if [ "$IN_PLACE" = "1" ]; then
  echo "  nada a copiar: o build já escreveu em $WEB_ROOT"
elif [ "$DRY_RUN" = "1" ]; then
  echo "  [dry-run] rsync dist/ -> $WEB_ROOT/"
else
  if command -v rsync >/dev/null; then
    rsync -a --delete dist/ "$WEB_ROOT/"
  else
    find "$WEB_ROOT" -mindepth 1 -delete
    cp -a dist/. "$WEB_ROOT/"
  fi
fi
ok "publicado"

log "Deploy concluído"
echo "  Site:    https://18check.online"
echo "  Backup:  $BACKUP_DIR/$STAMP"
echo "  Desfazer: ./deploy/rollback.sh"
echo
echo "  Dica: o navegador pode mostrar a versão antiga por causa do cache /"
echo "  service worker. Teste em aba anônima ou com Ctrl+Shift+R."
