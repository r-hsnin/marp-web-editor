# Marp Web Editor

Markdown でプレゼンテーションを作成する Web エディタ。  
リアルタイムプレビューと AI 支援機能を搭載。

![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Hono](https://img.shields.io/badge/Hono-4-E36002?style=flat-square)
![Bun](https://img.shields.io/badge/Bun-1.3-000?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Quick Start

```bash
# クローン
git clone https://github.com/r-hsnin/marp-web-editor.git
cd marp-web-editor

# インストール
bun install

# 環境変数（AI機能を使う場合）
cp backend/.env.example backend/.env
# backend/.env を編集してAPIキーを設定

# 起動（2つのターミナルで）
cd backend && bun run dev    # localhost:3001
cd frontend && bun run dev   # localhost:5173
```

http://localhost:5173 を開く

---

## Features

| 機能                   | 説明                                                                          |
| ---------------------- | ----------------------------------------------------------------------------- |
| リアルタイムプレビュー | Markdown 編集と同時にスライド確認、自動保存                                   |
| AI 支援                | 指示でスライド改善、対話的な編集支援（OpenAI / Anthropic / Google / Bedrock） |
| エクスポート           | PDF / PPTX / HTML / PNG / JPG（画像は先頭スライドのみ）                       |
| テーマ                 | 3 種内蔵（default / gaia / uncover）+ カスタム（professional）                |
| テンプレート           | 用途別テンプレートをワンクリック適用                                          |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│  Vite + React   │     │   Hono + Bun    │
│  localhost:5173 │     │  localhost:3001 │
└─────────────────┘     └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              ┌──────────┐       ┌──────────┐
              │ Marp CLI │       │  AI SDK  │
              │  render  │       │  agents  │
              └──────────┘       └──────────┘
```

---

## Tech Stack

### Frontend (`frontend/`)

| 技術                       | 用途              |
| -------------------------- | ----------------- |
| Vite 7 + React 19          | UI フレームワーク |
| TypeScript 5.9             | 型安全            |
| Tailwind CSS 4 + shadcn/ui | スタイリング      |
| CodeMirror 6               | エディタ          |
| Zustand                    | 状態管理          |
| AI SDK                     | チャット UI       |

### Backend (`backend/`)

| 技術         | 用途                                  |
| ------------ | ------------------------------------- |
| Hono 4 + Bun | API サーバー                          |
| Marp CLI     | スライドレンダリング                  |
| AI SDK       | AI 統合 (OpenAI / Anthropic / Google / Bedrock) |
| Puppeteer    | PDF/PPTX 生成                         |
| Zod          | バリデーション                        |

---

## Configuration

### AI 機能

`backend/.env` でプロバイダーと API キーを設定します。

```env
# プロバイダー選択: openai / anthropic / google / bedrock
AI_PROVIDER=openai

# 各プロバイダーの API キー（使用するものを設定）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Bedrock 使用時（AWS 標準認証）
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

モデルを変更する場合は `backend/src/lib/ai/config.ts` を編集してください。

### カスタムテーマ

`backend/themes/` に CSS ファイルを配置します。

```css
/* @theme mytheme */
@import "default";

section {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #eee;
}
```

AI にテーマのクラスを認識させたい場合は、`backend/guidelines/themes/mytheme.md` にガイドラインを作成します。

```markdown
# My Theme

## Available Classes

### highlight
<!-- _class: highlight -->
# Title
Use for: 強調スライド
```

サーバー再起動後に利用可能になります。

### カスタムテンプレート

`backend/templates/` に Markdown ファイルを配置し、`templates.json` に登録します。

```json
{
  "id": "my-template",
  "name": "テンプレート名",
  "description": "説明文",
  "icon": "📝"
}
```

サーバー再起動後に利用可能になります。

---

## Project Structure

```
marp-web-editor/
├── frontend/               # Vite + React
│   └── src/
│       ├── components/     # UI (editor/, preview/, ai/, ui/)
│       ├── hooks/          # カスタムフック
│       └── lib/            # ユーティリティ
│
├── backend/                # Hono API
│   ├── src/
│   │   ├── routes/         # APIエンドポイント
│   │   ├── lib/ai/         # AIエージェント・ツール
│   │   └── schemas/        # Zodスキーマ
│   ├── guidelines/         # AI用ガイドライン
│   │   ├── base-rules.md   # 基本ルール
│   │   └── themes/         # テーマ別ガイドライン
│   ├── templates/          # スライドテンプレート
│   └── themes/             # カスタムテーマCSS
│
└── biome.json              # Linter/Formatter設定
```

---

## Development

```bash
# 全体
bun install          # 依存関係インストール
bun run check        # Biomeでコード品質チェック

# Frontend
cd frontend
bun run dev          # 開発サーバー (5173)
bun run build        # 本番ビルド
bun run typecheck    # 型チェック

# Backend
cd backend
bun run dev          # 開発サーバー (3001)
bun run typecheck    # 型チェック
```
