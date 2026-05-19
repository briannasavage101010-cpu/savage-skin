#!/usr/bin/env bash
#
# Savage Skin — one-paste setup
# Installs Homebrew (if needed), gh CLI, Claude Code, then creates your GitHub
# repo and pushes the code. Safe to re-run; each step checks for already-done state.
#
# Usage:
#   cd ~/Desktop/"Savage Skin"/savage-skin
#   bash setup.sh
#
set -e

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
gray()  { printf "\033[90m%s\033[0m\n" "$*"; }

cyan "==> Savage Skin setup"
echo ""

# ---- 1. Homebrew ----
if ! command -v brew >/dev/null 2>&1; then
  cyan "==> Installing Homebrew (you may be asked for your Mac password)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for Apple Silicon
  if [ -d "/opt/homebrew" ]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
else
  green "✓ Homebrew installed"
fi

# ---- 2. Node ----
if ! command -v node >/dev/null 2>&1; then
  cyan "==> Installing Node.js"
  brew install node
else
  green "✓ Node $(node --version)"
fi

# ---- 3. gh CLI ----
if ! command -v gh >/dev/null 2>&1; then
  cyan "==> Installing GitHub CLI"
  brew install gh
else
  green "✓ gh $(gh --version | head -1 | awk '{print $3}')"
fi

# ---- 4. Claude Code ----
if ! command -v claude >/dev/null 2>&1; then
  cyan "==> Installing Claude Code"
  npm install -g @anthropic-ai/claude-code
else
  green "✓ Claude Code installed"
fi

# ---- 5. Project dependencies ----
if [ ! -d node_modules ]; then
  cyan "==> Installing project dependencies (Three.js, Lenis, Vite)"
  npm install
else
  green "✓ Project deps already installed"
fi

# ---- 5b. Ensure git state is clean and any new files are committed ----
# (The repo was initialized in a sandbox — clear any stale lock file and
# fix ownership of the .git folder to belong to YOU, not a sandbox user.)
rm -f .git/index.lock 2>/dev/null || sudo rm -f .git/index.lock 2>/dev/null || true
sudo chown -R "$(whoami)" .git 2>/dev/null || true

git config user.name "$(git config user.name || echo Brianna)"
git config user.email "$(git config user.email || echo brianna.savage101010@icloud.com)"

if [ -n "$(git status --porcelain)" ]; then
  cyan "==> Committing any pending changes (including setup.sh)"
  git add -A
  git commit -m "Add local setup updates" || true
fi

# ---- 6. gh auth ----
if ! gh auth status >/dev/null 2>&1; then
  cyan "==> Authenticating with GitHub"
  echo ""
  echo "A browser window will open. Sign in to GitHub and follow the prompts."
  echo ""
  gh auth login --git-protocol https --web
else
  green "✓ Already signed in to GitHub as $(gh api user --jq .login)"
fi

# ---- 7. Create + push repo ----
if git remote get-url origin >/dev/null 2>&1; then
  green "✓ Remote already set: $(git remote get-url origin)"
  cyan "==> Pushing latest commits"
  git push -u origin main || true
else
  cyan "==> Creating GitHub repo + pushing"
  gh repo create savage-skin --public --source=. --remote=origin --push
fi

# ---- 8. Enable Pages ----
USER=$(gh api user --jq .login)
cyan "==> Enabling GitHub Pages (Actions source)"
gh api -X POST "repos/$USER/savage-skin/pages" \
  -f "build_type=workflow" \
  --silent 2>/dev/null || gray "  (Pages may already be enabled — that's fine)"

echo ""
green "════════════════════════════════════════════════"
green " ✓ Repo live at: https://github.com/$USER/savage-skin"
green " ✓ Site will be at: https://$USER.github.io/savage-skin/"
green "   (first build takes ~3 minutes — check the Actions tab)"
green "════════════════════════════════════════════════"
echo ""
cyan "Next steps:"
echo "  1. Run 'npm run dev' to preview locally at http://localhost:5173"
echo "  2. When you have your Shopify token, follow GETTING-STARTED.md step 6"
echo "  3. Add Shopify secrets at:"
echo "       https://github.com/$USER/savage-skin/settings/secrets/actions"
echo "       (named VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN)"
echo "  4. Run 'claude' in this folder to start Claude Code"
echo ""
