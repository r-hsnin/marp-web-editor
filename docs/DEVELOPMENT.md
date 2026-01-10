# Development Guide

開発環境セットアップとトラブルシューティング。

---

## Prerequisites

### 1. Bun のインストール

```bash
# macOS / Linux / WSL
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

**確認**:
```bash
bun --version
# 1.0.0 以上
```

### 2. 環境変数の設定

```bash
cp backend/.env.example backend/.env
```

主要な環境変数:
- `AI_MODEL`: AIモデル（provider:model 形式、例: `openrouter:openai/gpt-4.1-mini`）
- `IMAGE_STORAGE`: 画像ストレージ（local / s3）

詳細は `backend/.env.example` を参照。

---

## Setup

### 1. 依存関係のインストール

```bash
# プロジェクトルートで実行
bun install
```

**Bun Workspaces** により、`frontend/`、`backend/`、`packages/shared/` の依存関係が一括インストールされます。

### 2. 開発サーバーの起動

```bash
# ターミナル1: Backend
cd backend
bun run dev
# http://localhost:3001

# ターミナル2: Frontend
cd frontend
bun run dev
# http://localhost:5173
```

---

## Development Commands

### Frontend (`frontend/`)

```bash
cd frontend

# 開発サーバー起動
bun run dev

# 本番ビルド
bun run build

# ビルド結果のプレビュー
bun run preview

# 型チェック
bun run typecheck
```

### Backend (`backend/`)

```bash
cd backend

# 開発サーバー起動
bun run dev

# 型チェック
bun run typecheck
```

### Root (全体)

```bash
# Lint & Format (全ファイル)
bun run check

# 未使用コード検出
bun run knip
```

### Eval (`eval/`)

```bash
cd eval

# AI機能のE2E評価実行（要: backend起動）
bun run eval

# 結果をWebUIで確認
bun run eval:view
```

詳細は [AI-EVAL.md](./AI-EVAL.md) を参照。

---
- `backend/tests/export.test.ts`: Marpエクスポート機能
## Troubleshooting

### Issue 1: Puppeteer "Browser is already running" (Windows)

#### 症状
```
Error: Browser is already running
```

PDF/PPTXエクスポートが失敗する。

#### 原因
Bun runtime 下で Puppeteer を実行すると、Windows環境でファイルロック競合が発生。

#### 解決策
**既に実装済み**: `backend/src/lib/marp.ts` で `node` を使って spawn するフォールバック実装。

```typescript
const runtime = process.platform === 'win32' ? 'node' : 'bun';
const proc = Bun.spawn([runtime, marpCliPath, ...args], { ... });
```

#### 確認方法
1. Frontend でスライドを作成
2. Export → PDF を選択
3. ダウンロードが成功すればOK

#### 追加情報
- **開発環境 (Windows)**: Edge を自動検出して使用
- **本番環境 (Docker)**: Chromium を使用
- **Reference**: `docs/ARCHITECTURE.md` - Puppeteer on Windows

---

### Issue 2: ESM Import Errors

#### 症状
```
error: 'import.meta' meta-property is only allowed when 'module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.
```

または

```
Cannot find module './file' or its corresponding type declarations.
```

#### 原因
`backend/package.json` に `"type": "module"` + `tsconfig.json` に `"moduleResolution": "NodeNext"` の組み合わせでは、相対インポートに `.js` 拡張子が必須。

#### 解決策
相対インポートに `.js` 拡張子を追加:

```typescript
// ❌ NG
import { generateSchema } from './schemas/ai';

// ✅ OK
import { generateSchema } from './schemas/ai.js';
```

#### `import.meta.dir` の問題
Bun固有の `import.meta.dir` は使用不可。`fileURLToPath(import.meta.url)` を使用。

---

### Issue 3: Type Errors in Frontend

#### 症状
```
Cannot find module '../../../backend/src/api-types' or its corresponding type declarations.
```

または

```
Type 'AppType' is not defined.
```

#### 原因
Hono RPC の型定義インポートパスが間違っている。

#### 解決策
`frontend/src/lib/api.ts` で正しいパスを指定:

```typescript
import type { AppType, ExportFormat } from '../../../backend/src/api-types';
```

**重要**: `backend/src/api-types.ts` は型定義のみをエクスポートし、ランタイム依存 (`puppeteer`, `@ai-sdk/openai` など) を含めないこと。

#### 確認方法
```bash
cd frontend
bun run check
# エラーがなければOK
```

---

### Issue 4: Theme Not Loading

#### 症状
- カスタムテーマがプレビューに表示されない
- テーマセレクターに表示されない

#### 確認手順

**1. テーマファイルの存在確認**:
```bash
ls backend/themes/
# polygon.css が存在するか
```

**2. API動作確認**:
```bash
# テーマリスト取得
curl http://localhost:3001/api/themes
# 期待値: {"themes":["polygon"]}

# テーマCSS取得
curl http://localhost:3001/api/themes/polygon
# 期待値: CSSコンテンツ
```

**3. ブラウザコンソール確認**:
- DevTools → Console
- `Failed to load theme` エラーがないか確認

#### 解決策

**テーマファイルが存在しない場合**:
```bash
# backend/themes/ にCSSファイルを配置
cp path/to/theme.css backend/themes/
```

**APIエラーの場合**:
- Backend サーバーが起動しているか確認
- `backend/src/routes/themes.ts` のログを確認

**フロントエンドエラーの場合**:
- `frontend/src/hooks/useThemeLoader.ts` のログを確認
- API URL が正しいか確認 (開発: `http://localhost:3001`)

---

### Issue 5: Port Already in Use

#### 症状
```
error: Failed to start server
EADDRINUSE: address already in use :::3000
```

#### 原因
ポート 3000 (Frontend) または 3001 (Backend) が既に使用されている。

#### 解決策

**プロセスを確認**:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# macOS / Linux
lsof -i :3000
lsof -i :3001
```

**プロセスを終了**:
```bash
# Windows (PowerShell)
Stop-Process -Id <PID>

# macOS / Linux
kill -9 <PID>
```

**または、別のポートを使用**:
```bash
# Frontend
PORT=3002 bun run dev

# Backend
PORT=3003 bun run dev
```

---

### Issue 6: Biome Errors

#### 症状
```bash
bun biome check .
# エラーが大量に表示される
```

#### 解決策

**自動修正**:
```bash
bun biome check --apply .
```

**特定のファイルのみ**:
```bash
bun biome check --apply frontend/src/components/
```

**無視すべきエラー**:
一部のエラーは正当な理由で無視する必要があります:

```typescript
// biome-ignore lint/security/noDangerouslySetInnerHtml: Marp生成HTMLは信頼できる
<div dangerouslySetInnerHTML={{ __html: html }} />
```

---

### Issue 7: AI API Errors

#### 症状
```
Error: OpenAI API key not found
```

#### 解決策

**API Key 未設定**:
```bash
# .env ファイルを編集（OpenRouter の場合）
AI_MODEL=openrouter:openai/gpt-4.1-mini
OPENROUTER_API_KEY=sk-or-...
```

**API Key 無効**:
- 各プロバイダーのダッシュボードで Key を確認
- 新しい Key を生成して `.env` を更新

---

### Issue 8: ログ確認方法

#### Backend ログ
```bash
cd backend && bun run dev
# 構造化JSON出力（pino）
# デフォルト: info レベル
```

#### Frontend ログ
ブラウザ DevTools → Console で確認。

#### ログレベル変更
```bash
LOG_LEVEL=warn bun run dev
```

詳細は [LOGGING.md](./LOGGING.md) を参照。

---

## Code Quality

### Biome Configuration

**設定ファイル**: `biome.json` (プロジェクトルート)

**主なルール**:
- **Linting**: 推奨ルールセット
- **Formatting**: indent: 2, quotes: single, lineWidth: 100
- **Ignore**: `["dist", ".next", "node_modules", "public", ".gemini", "legacy_src"]`

### TypeScript Configuration

**Frontend** (`frontend/tsconfig.json`):
- 参照構造を使用
  - `tsconfig.app.json`: アプリケーションコード
    - `module: ESNext`, `moduleResolution: bundler`
  - `tsconfig.node.json`: Vite設定ファイル
    - `module: ESNext`, `moduleResolution: bundler`

**Backend** (`backend/tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true
  }
}
```

**重要な違い**:
- Frontend: `bundler` (Vite用)
- Backend: `NodeNext` (ESM互換)

---

## Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - システム設計
- [AI.md](./AI.md) - AI機能
- [DOCKER.md](./DOCKER.md) - Docker環境

### External Resources
- [Bun](https://bun.sh/docs)
- [Hono](https://hono.dev/)
- [Marp](https://marp.app/)
- [Vite](https://vitejs.dev/)
