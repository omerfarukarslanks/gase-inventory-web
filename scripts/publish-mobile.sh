#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/react-native-app"
TARGET_DIR="${1:-$ROOT_DIR/../gase-inventory-mobile}"
REMOTE_URL="${2:-https://github.com/omerfarukarslanks/gase-inventory-mobile.git}"
COMMIT_EMAIL="${GIT_AUTHOR_EMAIL:-omer.arslan2@outlook.com}"
COMMIT_NAME="${GIT_AUTHOR_NAME:-omerfarukarslanks}"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source not found: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
rsync -av --exclude node_modules --exclude .git "$SOURCE_DIR/" "$TARGET_DIR/"

cd "$TARGET_DIR"
if [[ ! -d .git ]]; then
  git init
fi

echo "# gase-inventory-mobile" > README.md
git add .

if ! git diff --cached --quiet; then
  git -c user.email="$COMMIT_EMAIL" -c user.name="$COMMIT_NAME" commit -m "first commit"
fi

git branch -M main

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo "Repository prepared in $TARGET_DIR"
echo "Push with: git push -u origin main"
