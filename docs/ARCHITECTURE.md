# Architecture

システム設計と技術スタックの詳細。

---

## Overview

### What is Marp Web Editor?

Markdownでプレゼンテーションを作成するWebエディタ。

**主な機能**:
- リアルタイムMarkdownプレビュー
- 複数フォーマットへのエクスポート (PDF/PPTX/HTML/画像)
- AI支援によるスライド生成・改善
- カスタムテーマシステム
- テンプレート機能

### Architecture Philosophy

このプロジェクトは以下の原則に基づいて設計されています:

1. **Speed & Simplicity**: Bunによるミリ秒レベルの起動と実行
2. **End-to-End Type Safety**: Hono RPCで完全な型安全性を確保
3. **Premium UX**: 流動的でビジュアルに優れたUI

### Monorepo Structure

```
marp-web-editor/
├── frontend/          # Vite + React (Port 5173)
├── backend/           # Hono + Bun (Port 3001)
├── packages/shared/   # 共有型定義
├── docs/              # プロジェクトドキュメント
├── package.json       # Bun Workspaces設定
└── biome.json         # Linter/Formatter設定
```

**Communication**: Frontend ↔ Backend は Hono RPC で型安全に通信

---

## Tech Stack

### Runtime & Toolchain

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Bun** | Latest | Runtime & Package Manager |
| **Biome** | 2.3.10 | Linter & Formatter |
| **TypeScript** | 5.8+ | 型安全性 |

**Why Bun**:
- Node.jsより起動・インストールが高速
- TypeScript native サポート
- Web標準API準拠

**Why Biome**:
- ESLint + Prettier を統合し、設定ファイルを削減
- 高速な解析とフォーマット
- ゼロコンフィグで動作

---

### Frontend (`frontend/`)

#### Core Framework

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Vite** | 7.3.0 | 高速HMR、モダンビルドツール |
| **React** | 19.2.0 | UI構築 |
| **TypeScript** | 5.8+ | 型安全性 |

#### Styling

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Tailwind CSS** | 4.1.17 | ユーティリティファーストCSS |
| **shadcn/ui** | - | Radix UIベースの高品質コンポーネント |
| **Lucide React** | 0.554.0 | アイコン |

**Tailwind CSS v4**: `@tailwindcss/vite` プラグイン使用

#### State Management

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Zustand** | 5.0.8 | 軽量状態管理 |

**Stores**:
- `themeStore`: テーマ選択状態
- `editorStore`: エディタ状態

#### Editor

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **@uiw/react-codemirror** | 4.25.3 | Markdown エディタ |
| **CodeMirror 6** | - | シンタックスハイライト、拡張機能 |

#### Communication

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Hono RPC Client** | 4.11.3 | 型安全なAPI通信 |

```typescript
import { hc } from 'hono/client';
import type { AppType } from '@marp-editor/shared';

const client = hc<AppType>('/');
```

#### AI Integration

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **@ai-sdk/react** | 2.0.118 | React統合 |
| **ai** | 5.0.116 | AI SDK |

#### Logging

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **loglevel** | 1.9.2 | 軽量ログライブラリ (~1.5KB) |

---

### Backend (`backend/`)

#### Core Framework

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Hono** | 4.11.3 | 軽量Webフレームワーク |
| **@hono/zod-validator** | 0.7.5 | バリデーション |

**Why Hono**:
- Web標準API準拠 (Request/Response)
- Bun native サポート
- RPC機能による型安全性
- 高速なルーティング

#### Validation

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Zod** | 4.2.1 | スキーマバリデーション |

#### Logging

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **pino** | 10.1.0 | 構造化ログ、高速出力 |
| **hono-pino** | 0.10.3 | Hono middleware統合 |

**ログレベル**: error / warn / info のみ（debug 不使用）

#### Slide Engine

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **@marp-team/marp-cli** | 4.2.3 | Markdown → スライド変換 |
| **puppeteer-core** | 24.34.0 | Chromium制御 |

**対応フォーマット**: PDF, PPTX, HTML

**重要**: Windows環境では `node` で spawn (後述)

#### AI Integration

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **ai** | 5.0.116 | AI SDK |
| **@ai-sdk/openai** | 2.0.88 | OpenAI統合 |
| **@ai-sdk/anthropic** | 2.0.56 | Anthropic統合 |
| **@ai-sdk/google** | 2.0.51 | Google統合 |
| **@ai-sdk/amazon-bedrock** | 3.0.72 | AWS Bedrock統合 |

**機能**:
- マルチプロバイダー対応（OpenAI, Anthropic, Google, Bedrock）
- ストリーミングレスポンス対応
- Hono との統合が容易

---

## Directory Structure

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── ui/             # shadcn/ui コンポーネント
│   │   ├── editor/         # エディタ関連
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── PanelSwitcher.tsx
│   │   │   ├── Preview.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── PreviewToolbar.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── SlideList.tsx
│   │   │   ├── SlideView.tsx
│   │   │   └── MarpIsolatedStyle.tsx
│   │   ├── header/         # ヘッダー
│   │   │   ├── ExportMenu.tsx
│   │   │   └── PaginationToggle.tsx
│   │   └── ai/             # AI関連UI
│   │       ├── ChatView.tsx
│   │       ├── InteractiveComponent.tsx
│   │       ├── ProposalCard.tsx
│   │       ├── ProposalCarousel.tsx
│   │       └── AddProposalCard.tsx
│   ├── hooks/              # カスタムフック
│   │   ├── useMarp.ts      # Marpインスタンス管理
│   │   ├── useMarpChat.ts  # AI チャット
│   │   ├── useSlides.ts    # スライド管理
│   │   └── useThemeLoader.ts  # テーマ動的読み込み
│   ├── layouts/            # レイアウトコンポーネント
│   │   └── MainLayout.tsx  # メインレイアウト
│   ├── lib/                # ユーティリティ
│   │   ├── api.ts          # Hono RPC クライアント
│   │   ├── store.ts        # Zustand store
│   │   ├── chatStore.ts    # チャット状態管理
│   │   ├── editor-commands.ts  # エディタコマンド
│   │   ├── utils.ts        # ユーティリティ関数
│   │   └── marp/           # Marp関連ロジック
│   │       ├── themeStore.ts      # テーマ状態管理
│   │       ├── frontmatterProcessor.ts
│   │       └── settingsTypes.ts
│   └── index.css           # グローバルスタイル
├── public/                 # 静的アセット
└── package.json
```

### Backend (`backend/`)

```
backend/
├── src/
│   ├── routes/             # APIエンドポイント
│   │   ├── ai.ts           # AI生成API
│   │   ├── export.ts       # エクスポートAPI
│   │   ├── themes.ts       # テーマAPI
│   │   ├── templates.ts    # テンプレートAPI
│   │   └── images.ts       # 画像API
│   ├── lib/                # ビジネスロジック
│   │   ├── marp.ts         # Marp CLI ラッパー
│   │   ├── validation.ts   # 共通バリデーション
│   │   ├── storage/        # ストレージ抽象化
│   │   │   ├── index.ts
│   │   │   ├── local.ts
│   │   │   └── s3.ts
│   │   └── ai/             # AI関連
│   │       ├── registry.ts     # Provider Registry
│   │       ├── config.ts       # モデル設定
│   │       ├── orchestrator.ts # Intent分析・ルーティング
│   │       ├── promptBuilder.ts # システムプロンプト構築
│   │       ├── tools.ts        # ツール定義
│   │       └── agents/         # 専門エージェント
│   │           ├── architect.ts
│   │           ├── editor.ts
│   │           └── general.ts
│   ├── schemas/            # Zodバリデーション
│   │   ├── ai.ts           # AI生成スキーマ
│   │   └── export.ts       # エクスポートスキーマ
│   ├── app.ts              # Honoアプリケーション
│   └── index.ts            # エントリーポイント
├── guidelines/             # AIガイドライン
│   ├── base-rules.md       # 基本ルール
│   └── themes/             # テーマ別ガイドライン
│       ├── polygon.md
│       └── midnight.md
├── themes/                 # テーマCSSファイル
│   ├── polygon.css
│   └── midnight.css
├── templates/              # テンプレートファイル
│   ├── templates.json      # テンプレート定義
│   ├── marp-basic-manual.md
│   ├── polygon-theme-manual.md
│   ├── midnight-theme-manual.md
│   ├── business-presentation.md
│   └── tech-presentation.md
├── tests/                  # テストファイル
└── package.json
```

---

## Key Technical Decisions

### 1. Puppeteer on Windows

#### Problem
Bun runtime 下で `@marp-team/marp-cli` (Puppeteer使用) を実行すると、Windows環境で以下のエラーが発生:

```
Error: Browser is already running
```

**原因**: Bun runtime環境でPuppeteerのブラウザプロセス管理に問題が発生。

#### Solution
`backend/src/lib/marp.ts` で、Puppeteer を含む処理を **`node` で spawn** するフォールバック実装:

```typescript
async convert(options: ConvertOptions): Promise<Buffer> {
  // Windows環境では node を使用
  const runtime = process.platform === 'win32' ? 'node' : 'bun';
  
  const proc = Bun.spawn([runtime, marpCliPath, ...args], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      CHROME_PATH: chromePath, // Windows: Edge自動検出
    },
  });
  
  // ... (処理続行)
}
```

**重要**: 
- 開発環境 (Windows) と本番環境 (Docker/Linux) の両立
- `CHROME_PATH` の自動解決 (Windows: Edge, Docker: Chromium)

**Reference**: `AGENTS.md` - Puppeteer Exception

---

### 2. ESM Compatibility

#### Configuration
`backend/package.json`:
```json
{
  "type": "module"
}
```

`backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

#### Requirements
この設定では、以下が必須:

1. **相対インポートに `.js` 拡張子を追加**:
   ```typescript
   // ❌ NG
   import { generateSchema } from './schemas/ai';
   
   // ✅ OK
   import { generateSchema } from './schemas/ai.js';
   ```

2. **`import.meta.dir` (Bun固有) を使用しない**:
   ```typescript
   // ❌ NG (Bun固有)
   const __dirname = import.meta.dir;
   
   // ✅ OK (Node.js互換)
   import { fileURLToPath } from 'node:url';
   import { dirname } from 'node:path';
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   ```

---

### 3. Type Safety (Hono RPC)

#### Problem
手動 `fetch` では型安全性が低く、API変更時にフロントエンドでエラーが検出されない。

#### Solution
**Hono RPC** を使用し、共有パッケージの型定義をフロントエンドで直接利用:

**Shared** (`packages/shared/src/api-types.ts`):
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// スキーマ定義
export const exportSchema = z.object({ ... });

// Hono RPC 型定義
const routes = new Hono()
  .route('/api/export', ...)
  .route('/api/ai', ...)
  .route('/api/themes', ...)
  .route('/api/templates', ...);

export type AppType = typeof routes;
```

**Frontend** (`frontend/src/lib/api.ts`):
```typescript
import { hc } from 'hono/client';
import type { AppType, ExportFormat } from '@marp-editor/shared';

const client = hc<AppType>('/');

export const exportSlide = async (
  markdown: string,
  format: ExportFormat,
  theme?: string,
) => {
  const res = await client.api.export.$post({
    json: { markdown, format, theme },
  });
  // 完全な型推論が効く
};
```

**Benefits**:
- コンパイル時に型エラーを検出
- API変更時にフロントエンドで即座にエラー
- 手動での型定義重複が不要

---

## Theme System Architecture

### Overview

テーマをバックエンドで一元管理する構成:

```
backend/themes/
  ├── polygon.css   ← Single Source of Truth
  └── midnight.css

backend/src/routes/themes.ts
  ├── GET /api/themes          → テーマ名リスト
  └── GET /api/themes/:name    → CSS配信

backend/src/lib/marp.ts
  └── resolve(process.cwd(), 'themes', `${theme}.css`)  ✅

frontend/src/hooks/useThemeLoader.ts
  └── fetch(`/api/themes/${name}`)  ✅
```

### API Endpoints

#### `GET /api/themes`
テーマ名の配列を返す。

**Response**:
```json
{
  "themes": ["polygon", "midnight"]
}
```

#### `GET /api/themes/:name`
指定されたテーマのCSSを返す。

**Security**:
- Whitelist validation: `/^[a-zA-Z0-9_\-]+$/`
- Path traversal protection: `path.join()` 使用
- File existence check: `fs.access()` 使用

**Response Headers**:
```
Content-Type: text/css
Cache-Control: public, max-age=3600
```

### Theme Types

#### Built-in Themes
Marp公式テーマ (Marp Core に含まれる):
- `default`
- `gaia`
- `uncover`

#### Custom Themes
`backend/themes/` に配置されたCSSファイル:
- `polygon`: ビジネス向けテーマ
- `midnight`: コード重視のダークテーマ
- 管理者が追加可能

### Adding Custom Themes

管理者は以下の手順でカスタムテーマを追加できます:

1. Marp記法に従ったCSSファイルを作成
2. `backend/themes/` に配置
3. バックエンドサーバーを再起動
4. テーマセレクターに自動表示

**Example** (`backend/themes/custom.css`):
```css
/* @theme custom */
@import "default";

section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

---

## Template System Architecture

### Overview

テンプレートをバックエンドで一元管理する構成:

```
backend/templates/
  ├── templates.json           # テンプレート定義
  ├── marp-basic-manual.md     # Marp基本マニュアル
  ├── polygon-theme-manual.md  # Polygonテーママニュアル
  ├── midnight-theme-manual.md # Midnightテーママニュアル
  ├── business-presentation.md # ビジネスプレゼン
  └── tech-presentation.md     # LTテンプレート

backend/src/routes/templates.ts
  ├── GET /api/templates          → テンプレート一覧
  └── GET /api/templates/:name    → テンプレート内容
```

### API Endpoints

#### `GET /api/templates`
テンプレート情報の配列を返す。

**Response**:
```json
{
  "templates": [
    {
      "id": "business-presentation",
      "name": "ビジネスプレゼン",
      "description": "会社紹介・提案書向け",
      "icon": "📊",
      "category": "template",
      "theme": "Polygon"
    }
  ]
}
```

#### `GET /api/templates/:name`
指定されたテンプレートのMarkdownを返す。

**Security**:
- Whitelist validation: `/^[a-zA-Z0-9_\-]+$/`
- Path traversal protection: `path.join()` 使用
- File existence check: `fs.access()` 使用

**Response Headers**:
```
Content-Type: text/markdown
Cache-Control: public, max-age=3600
```

---

## AI System Architecture

### Overview

AI機能は **Orchestrator Pattern** で構成されています:

```
User Input → Orchestrator (Intent Analysis) → Specialist Agent → Tool Calling → Frontend
```

### Components

```
backend/src/lib/ai/
├── registry.ts         # Provider Registry (マルチプロバイダー対応)
├── config.ts           # モデル設定
├── orchestrator.ts     # Intent分析・エージェントルーティング
├── promptBuilder.ts    # システムプロンプト構築
├── tools.ts            # ツール定義
├── toolFormatter.ts    # ツール出力を Markdown 形式に変換
└── agents/
    ├── architect.ts    # 構成設計・レビュー (propose_plan, propose_review)
    ├── editor.ts       # 編集 (propose_edit, propose_insert, propose_replace)
    └── general.ts      # 会話・質問応答
```

### Tool Calling (Human-in-the-loop)

| Tool | Purpose | Execution |
|------|---------|-----------|
| `propose_edit` | 既存スライドの編集 | Frontend (Apply/Discard) |
| `propose_insert` | スライドの挿入 | Frontend (Apply/Discard) |
| `propose_replace` | 全スライドの置換 | Frontend (Apply/Discard) |
| `propose_plan` | 構成提案 | Frontend (表示のみ) |
| `propose_review` | スライドのレビュー・評価 | Frontend (表示のみ) |

### Frontend Integration

**Hook** (`frontend/src/hooks/useMarpChat.ts`):
- `DefaultChatTransport` でコンテキスト送信
- `X-Agent-Intent` ヘッダーでエージェント種別を取得
- `addToolOutput` で Human-in-the-loop 結果を返却

**詳細**: `docs/AI.md`

---

## Current Configuration

### Development
```bash
# Frontend: http://localhost:5173
cd frontend && bun run dev

# Backend: http://localhost:3001
cd backend && bun run dev
```

### Environment Variables

Backend (`backend/.env`):
- `AI_MODEL`: AIモデル（provider:model 形式、例: `openrouter:openai/gpt-4.1-mini`）
- `OPENROUTER_API_KEY`: OpenRouter API キー
- `OPENAI_API_KEY`: OpenAI API キー
- `ANTHROPIC_API_KEY`: Anthropic API キー
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google AI API キー
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: Bedrock 用
- `IMAGE_STORAGE`: 画像ストレージ（local / s3）
- `S3_BUCKET` / `S3_REGION`: S3 使用時

詳細は `backend/.env.example` を参照してください。

---

## Current Status

### Implemented Features
- ✅ エディタ・プレビュー
- ✅ エクスポート機能 (PDF/PPTX/HTML/PNG/JPG)
- ✅ テーマシステム
- ✅ テンプレート機能
- ✅ AI機能 (Orchestrator + 3 Agents)
- ✅ Theme-Aware Generation
- ✅ Multi-model Support (OpenAI, Anthropic, Google, Bedrock, OpenRouter)
- ✅ Docker対応 (開発環境向け)

---

## Deployment

### Docker (開発環境向け)
```bash
docker-compose up --build
```

### Production (GitHub Pages)

Frontend は GitHub Pages でホスティング:
- デモ: https://r-hsnin.github.io/marp-web-editor/

本番環境では GitHub Pages を推奨。

---

## References

- **Project Guidelines**: `AGENTS.md` (プロジェクトルート)
- **Marp Documentation**: https://marp.app/
- **Hono Documentation**: https://hono.dev/
- **AI SDK Documentation**: https://v5.ai-sdk.dev/

---

## 関連ドキュメント

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発環境構築
- [AI.md](./AI.md) - AI機能の実装
- [DOCKER.md](./DOCKER.md) - Docker環境
