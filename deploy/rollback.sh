#!/usr/bin/env bash
#
# Rollback do frontend [18+]Check — volta o site para um backup anterior.
#
# Uso:
#   ./deploy/rollback.sh              # lista os backups e deixa você escolher
#   ./deploy/rollback.sh 20260727-1130  # volta direto para esse backup
# ---------------------------------------------------------------------------

set -euo pipefail

WEB_ROOT="${WEB_ROOT:-/var/www/18check-frontend/dist}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/18check}"

log()  { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m  ✓ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m  ✗ %s\033[0m\n' "$*" >&2; exit 1; }

[ -d "$BACKUP_DIR" ] || fail "Nenhum backup encontrado em $BACKUP_DIR"

mapfile -t BACKUPS < <(ls -1dt "$BACKUP_DIR"/*/ 2>/dev/null | xargs -r -n1 basename)
[ "${#BACKUPS[@]}" -gt 0 ] || fail "Nenhum backup encontrado em $BACKUP_DIR"

TARGET="${1:-}"

if [ -z "$TARGET" ]; then
  log "Backups disponíveis (mais recente primeiro)"
  i=1
  for b in "${BACKUPS[@]}"; do
    echo "  $i) $b"
    i=$((i + 1))
  done
  echo
  read -r -p "  Número do backup para restaurar: " choice
  [[ "$choice" =~ ^[0-9]+$ ]] || fail "escolha inválida"
  [ "$choice" -ge 1 ] && [ "$choice" -le "${#BACKUPS[@]}" ] || fail "escolha fora do intervalo"
  TARGET="${BACKUPS[$((choice - 1))]}"
fi

SRC="$BACKUP_DIR/$TARGET"
[ -d "$SRC" ] || fail "Backup não existe: $SRC"

log "Restaurando $TARGET para $WEB_ROOT"
echo "  Isso substitui TUDO que está no ar agora."
read -r -p "  Confirmar? (digite SIM) " confirm
[ "$confirm" = "SIM" ] || fail "cancelado"

# Antes de sobrescrever, guarda o estado atual — para poder desfazer o rollback
SAFETY="$BACKUP_DIR/pre-rollback-$(date +%Y%m%d-%H%M%S)"
cp -a "$WEB_ROOT" "$SAFETY"
echo "  estado atual salvo em: $SAFETY"

if command -v rsync >/dev/null; then
  rsync -a --delete "$SRC"/ "$WEB_ROOT"/
else
  find "$WEB_ROOT" -mindepth 1 -delete
  cp -a "$SRC"/. "$WEB_ROOT"/
fi

ok "rollback concluído"
echo "  Teste em aba anônima: https://18check.online"
