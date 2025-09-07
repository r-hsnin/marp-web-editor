# Marp Web Editor

**Markdownでプレゼンテーションを作成するための、リアルタイムプレビュー機能を備えたWebエディタ**

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![Marp](https://img.shields.io/badge/Marp-CLI-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ 主な機能

### 📝 エディタ・プレビュー

- **リアルタイムプレビュー** - Markdownを編集すると即座にスライドプレビューが更新
- **分割画面** - ドラッグでリサイズ可能な分割画面
- **シンタックスハイライト** - CodeMirror 6によるMarkdown構文強調表示
- **自動保存と復元** - 編集内容が2秒間隔でLocalStorageに保存し、ページリロード時に保存された内容を復元
- **ダークモード** - ダークモードに対応

### 📋 テンプレート機能

- **4つの実用的テンプレート** - ビジネス、技術発表、マニュアル等の用途別テンプレート
- **ワンクリック適用** - テンプレート選択で即座にスライド作成開始
- **カスタムテンプレート対応** - 管理者が独自テンプレートを追加可能

### 🎨 テーマ・カスタマイズ

- **内蔵テーマ** - default、gaia、uncover、professionalの4つのテーマ
- **カスタムテーマ対応** - 管理者がCSSファイルを配置するだけで独自テーマを追加可能
- **UI設定コントロール** - GUIでテーマ、サイズ、ページネーション設定
- **手動フロントマター対応** - 手動設定時は該当UIをグレーアウト表示
- **リアルタイム切り替え** - 設定変更が即座にプレビューに反映
- **完全なエクスポート対応** - カスタムテーマでのHTML/PDF/PPTX出力

### 🤖 AI支援機能（OpenAI）

- **ワンショット修正** - 簡単な指示でスライドを即座に改善
- **エージェント型チャット** - 対話的なスライド編集支援
- **専門的アドバイス** - Marpガイドラインに基づいた適切な提案
- **レート制限** - 安全な利用制限（10回/分・15回/分、ratelimit.ts実装）
- **オプション機能** - OpenAI API Key設定時のみ有効

### 📤 エクスポート機能

- **HTML** - フルスクリーンプレゼンテーション機能付きHTMLファイル
- **PDF** - PDFファイル形式でのエクスポート
- **PPTX** - PowerPoint形式でのエクスポート

### 🔗 共有機能

- **セキュアな共有** - ユニークURLでプレゼンテーションを安全に共有
- **パスワード保護** - bcryptによる強固なパスワード暗号化
- **有効期限設定** - 24時間、7日間、30日間から選択可能
- **アクセス管理** - アクセス数の追跡と期限切れの自動処理

---

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/r-hsnin/marp-web-editor.git
cd marp-web-editor

# 依存関係をインストール
npm install

# 環境変数を設定
copy .env.example .env

# データベースを初期化
npx prisma generate
npx prisma db push

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

### Dockerを使用した起動

```bash
# Dockerイメージをビルド
docker build -f Dockerfile.production -t marp-web-editor .

# コンテナを起動（ポート3000:3000でマッピング）
docker run -p 3000:3000 marp-web-editor
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

---

## 🛠️ 技術スタック

### フロントエンド

| 技術             | バージョン | 用途                                       |
| ---------------- | ---------- | ------------------------------------------ |
| **Next.js**      | 15.5.2     | App Routerによるフルスタックフレームワーク |
| **React**        | 19         | ユーザーインターフェース構築               |
| **TypeScript**   | 5.8.3      | 型安全な開発環境                           |
| **Tailwind CSS** | 4          | ユーティリティファーストCSS                |
| **shadcn/ui**    | -          | 高品質UIコンポーネント                     |
| **CodeMirror 6** | -          | 高機能テキストエディタ                     |
| **Allotment**    | -          | リサイズ可能な分割画面                     |
| **AI SDK**       | 5.0.24     | OpenAI API統合・React対応                  |
| **react-markdown** | 10.1.0   | Markdownレンダリング                       |
| **remark-gfm**   | 4.0.1      | GitHub Flavored Markdown対応              |
| **@tailwindcss/typography** | 0.5.16 | タイポグラフィプラグイン           |
| **Zod**          | 4.1.3      | 型安全なバリデーション                     |

### バックエンド・データ

| 技術                    | バージョン | 用途                         |
| ----------------------- | ---------- | ---------------------------- |
| **Next.js API Routes**  | -          | サーバーサイドAPI            |
| **Prisma**              | 6.11.1     | データベースORM              |
| **SQLite**              | -          | 軽量データベース             |
| **@marp-team/marp-cli** | 4.2.0      | スライドレンダリングエンジン |
| **bcrypt**              | 6.0.0      | パスワードハッシュ化         |
| **nanoid**              | 5.1.5      | ユニークID生成               |

### 開発・ビルドツール

| 技術           | 用途               |
| -------------- | ------------------ |
| **ESLint**     | コード品質管理     |
| **Prettier**   | コードフォーマット |
| **TypeScript** | 厳格な型チェック   |

---

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   │   ├── ai/            # AI機能API
│   │   ├── health/        # ヘルスチェックAPI
│   │   ├── marp-render/   # プレビューレンダリング
│   │   ├── marp-export/   # ファイルエクスポート
│   │   ├── themes/        # テーマ関連API
│   │   └── share/         # 共有機能
│   ├── share/[shareId]/   # 共有ページ
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/uiコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── editor/           # エディタ関連
│   ├── preview/          # プレビュー関連
│   ├── ai/               # AI関連UI
│   ├── templates/        # テンプレート機能
│   └── share/            # 共有機能
├── lib/                  # ユーティリティ関数
│   ├── marp/             # Marp機能統合
│   ├── export/           # エクスポート機能
│   ├── storage/          # LocalStorage管理
│   ├── ai/               # AI処理ロジック
│   │   ├── tools/        # AIツール群
│   │   └── prompts/files/ # プロンプト管理
│   ├── themes/           # テーマ処理ライブラリ
│   ├── ratelimit.ts      # レート制限実装
│   └── error/            # エラーハンドリング
├── types/                # TypeScript型定義
└── ...
```

**静的ファイル**:

```
public/
├── themes/               # カスタムテーマファイル
├── templates/            # テンプレートファイル
├── guidelines/           # Marpガイドライン
├── images/               # テーマ用画像ファイル
└── ...
```

---

## 🔧 開発コマンド

```bash
# データベース操作
npx prisma generate    # Prismaクライアント生成
npx prisma db push     # スキーマ変更適用

# TypeScript型チェック
npx tsc --noEmit

# コード品質チェック
npm run lint

# コードフォーマット
npm run format

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

---

## 📖 使用方法

### 基本的な使い方

1. **テンプレート選択**（任意） - 用途に応じたテンプレートを選択
2. **エディタでMarkdownを編集** - 左側のエディタでMarp記法を使用してスライドを作成
3. **リアルタイムプレビュー** - 右側でスライドのプレビューを確認
4. **テーマ選択** - ヘッダーのテーマセレクターで外観を変更
5. **エクスポート** - 完成したスライドをHTML、PDF、PPTXで出力
6. **共有** - Shareボタンでセキュアなリンクでプレゼンテーションを共有
7. **AI支援** - OpenAI API Key設定でAIボタンが表示、スライド改善支援

### Marp記法の例

```markdown
# タイトルスライド

プレゼンテーションの概要

---

## 内容スライド

- ポイント1
- ポイント2
- ポイント3

---

<!-- _class: invert -->

# 反転カラースライド

特別な強調スライド
```

### カスタムテーマの追加

管理者は独自のテーマを簡単に追加できます：

1. **CSSファイルを作成** - Marp記法に従ったテーマCSSを作成
2. **ファイルを配置** - `public/themes/` ディレクトリにCSSファイルを配置
3. **画像ファイル** - 背景画像などは `public/images/` に配置
4. **自動認識** - アプリケーション再起動後、テーマセレクターに自動表示

#### テーマファイル例

```css
/* @theme custom */
@import "default";

section {
  background-image: url("../images/background.png");
  background-size: cover;
}
```

### カスタムテンプレートの追加

管理者は独自のテンプレートを簡単に追加できます：

1. **Markdownファイルを作成** - Marp記法に従ったテンプレートを作成
2. **ファイルを配置** - `public/templates/` ディレクトリに `.md` ファイルを配置
3. **メタデータを追加** - `src/components/templates/templateData.ts` にテンプレート情報を追加
4. **自動認識** - アプリケーション再起動後、テンプレート選択に自動表示

---

## 🔍 運用・監視

### ヘルスチェック

```bash
# アプリケーション状態確認
curl http://localhost:3000/api/health

# レスポンス例
{
  "status": "healthy",
  "timestamp": "2025-09-01T20:55:05.681Z",
  "uptime": 150.554033699,
  "memory": {...},
  "version": "0.4.0"
}
```

### Docker運用

```bash
# 最適化ビルド
docker build -f Dockerfile.production -t marp-web-editor .

# ヘルスチェック付き起動
docker run -p 3000:3000 marp-web-editor

# コンテナ状態確認
docker ps  # health: healthy を確認
```

---

## ⚙️ 環境変数

`.env` ファイルを作成し、以下の変数を設定してください：

```env
# データベース
DATABASE_URL="file:./dev.db"

# 共有機能用（本番環境）
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# AI機能（オプション）
OPENAI_API_KEY="sk-..."
```

### 重要な環境変数

- **`NEXT_PUBLIC_BASE_URL`** - ビルド時に固定化される。本番ドメインを設定
- **`DATABASE_URL`** - ランタイム変更可能
- **`PORT`/`HOSTNAME`** - サーバー起動設定（ランタイム変更可能）

詳細な環境変数については `.env.example` を参照してください。

---

## 開発ガイドライン

- **TypeScript厳格モード** - `any`型の使用禁止
- **コード品質** - ESLint + Prettier による統一フォーマット
- **型安全性** - 全関数・コンポーネントに適切な型定義

---

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

## 🙏 謝辞

このプロジェクトは以下の素晴らしいプロジェクトによって支えられています。

- [Marp](https://marp.app/) - 素晴らしいMarkdownプレゼンテーションツール
- [Next.js](https://nextjs.org/) - 優れたReactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - 効率的なCSSフレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - 美しいUIコンポーネント
- [CodeMirror](https://codemirror.net/) - 高機能エディタライブラリ
- [Prisma](https://www.prisma.io/) - 次世代データベースツールキット
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI機能統合ライブラリ
- [OpenAI](https://openai.com/) - 高性能AI言語モデル
- [Zod](https://zod.dev/) - TypeScript型安全バリデーション

---

<div align="center">

**[⬆ トップに戻る](#marp-web-editor)**

</div>
