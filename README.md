# Marp Web Editor

Markdown でプレゼンテーションを作成する Web エディタ。  
リアルタイムプレビューと AI 支援機能を搭載。

🌐 **[Demo](https://r-hsnin.github.io/marp-web-editor/)**

![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Hono](https://img.shields.io/badge/Hono-4-E36002?style=flat-square)
![Bun](https://img.shields.io/badge/Bun-1.3-000?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Quick Start

### ローカル開発

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

### Docker

```bash
git clone https://github.com/r-hsnin/marp-web-editor.git
cd marp-web-editor

# 環境変数（AI機能を使う場合）
cp backend/.env.example backend/.env
# backend/.env を編集

docker-compose up --build
```

http://localhost:3000 を開く

---

## Features

| 機能                   | 説明                                        |
| ---------------------- | ------------------------------------------- |
| リアルタイムプレビュー | Markdown 編集と同時にスライド確認、自動保存 |
| AI 支援                | 指示でスライド改善、対話的な編集支援        |
| 画像アップロード       | ローカル画像をドラッグ&ドロップで挿入       |
| エクスポート           | PDF / PPTX / HTML / PNG / JPG               |
| テーマ                 | デフォルトテーマ 3 種 + カスタムテーマ      |
| テンプレート           | 用途別テンプレートをワンクリック適用        |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│  Vite + React   │     │   Hono + Bun    │
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

| Frontend | Backend |
|----------|---------|
| Vite + React | Hono + Bun |
| TypeScript | Marp CLI |
| Tailwind CSS + shadcn/ui | AI SDK |
| CodeMirror | Puppeteer |

詳細は [ARCHITECTURE.md](./docs/ARCHITECTURE.md) を参照。

---

## Configuration

### AI 機能

`backend/.env` でプロバイダーと API キーを設定します。  
未設定の場合、AI ボタンは非表示になります。

```env
# プロバイダー選択（必須）: openai / anthropic / google / bedrock
AI_PROVIDER=openai

# 選択したプロバイダーの API キーを設定
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# Bedrock 使用時（AWS 認証情報 or ~/.aws/credentials）
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

モデルを変更する場合は `backend/src/lib/ai/config.ts` を編集してください。

### 画像ストレージ

デフォルトはローカル保存。本番環境では S3 を推奨。

```env
# ストレージ選択: local / s3
IMAGE_STORAGE=local

# S3 使用時
S3_BUCKET=your-bucket
S3_REGION=ap-northeast-1
```

S3 使用時は AWS 認証情報が必要です（環境変数 or `~/.aws/credentials`）。

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
bun install          # 依存関係インストール
bun run check        # Biomeでコード品質チェック

# 起動
cd frontend && bun run dev   # 開発サーバー (5173)
cd backend && bun run dev    # 開発サーバー (3001)
```

詳細は [DEVELOPMENT.md](./docs/DEVELOPMENT.md) を参照。

---

## Documentation

| ドキュメント | 内容 |
|-------------|------|
| [Development Guide](./docs/DEVELOPMENT.md) | 開発環境構築・トラブルシューティング |
| [Architecture](./docs/ARCHITECTURE.md) | システム設計・技術スタック |
| [AI Feature](./docs/AI.md) | AI機能の実装 |
| [Docker](./docs/DOCKER.md) | Docker環境 |
