# Marp Web Editor - Frontend

**Vite + React + TypeScript による、モダンなSPAフロントエンド**

## ✨ 概要

Markdownでプレゼンテーションを作成するための、リアルタイムプレビュー機能を備えたWebエディタのフロントエンド実装。

### 主な機能

- **リアルタイムプレビュー** - CodeMirror 6によるMarkdown編集とMarpプレビュー
- **分割画面** - ドラッグでリサイズ可能な編集画面とプレビュー
- **ダーク/ライトテーマ** - システムテーマに対応した美しいデザイン
- **レスポンシブUI** - モバイルからデスクトップまで対応
- **テーマセレクター** - 複数のMarpテーマから選択可能
- **ページネーション設定** - スライド番号の表示/非表示

## 🛠️ 技術スタック

| 技術                      | バージョン | 用途                        |
| ------------------------- | ---------- | --------------------------- |
| **Vite**                  | 6.x        | 高速ビルドツール            |
| **React**                 | 19.x       | UIライブラリ                |
| **TypeScript**            | 5.x        | 型安全な開発                |
| **Tailwind CSS**          | 4.x        | ユーティリティファーストCSS |
| **shadcn/ui**             | -          | UIコンポーネントライブラリ  |
| **CodeMirror 6**          | -          | 高機能テキストエディタ      |
| **@uiw/react-codemirror** | -          | React用CodeMirrorラッパー   |
| **Lucide React**          | -          | アイコンライブラリ          |
| **Zustand**               | -          | 軽量状態管理                |
| **@marp-team/marp-core**  | -          | Marpレンダリングエンジン    |

## 📁 プロジェクト構造

```
frontend/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/             # shadcn/ui基本コンポーネント
│   │   ├── header/         # ヘッダー関連コンポーネント
│   │   └── editor/         # エディタツールバー等
│   ├── layouts/            # レイアウトコンポーネント
│   │   └── MainLayout.tsx  # メインレイアウト
│   ├── hooks/              # カスタムフック
│   │   └── use-mobile.tsx  # レスポンシブ検出
│   ├── lib/                # ユーティリティ
│   │   ├── utils.ts        # 汎用ヘルパー
│   │   └── marp/           # Marp関連処理
│   ├── assets/             # 静的アセット
│   ├── App.tsx             # ルートコンポーネント
│   ├── main.tsx            # エントリーポイント
│   └── index.css           # グローバルスタイル
├── public/                 # 公開ファイル
├── index.html              # HTMLテンプレート
├── vite.config.ts          # Vite設定
├── tailwind.config.js      # Tailwind CSS設定
├── tsconfig.json           # TypeScript設定
└── package.json            # 依存関係
```

## 🚀 開発

### 前提条件

- Node.js 18.0以上
- npm または yarn

### セットアップ

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開いてアプリケーションを確認してください。

### 開発コマンド

```bash
# 開発サーバー起動（HMR有効）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# TypeScript型チェック
npx tsc --noEmit

# コード品質チェック
npm run lint

# コードフォーマット
npm run format
```

## 🎨 デザインシステム

### カラーパレット

Tailwind CSS v4の`@theme`ディレクティブを使用し、CSS変数ベースのテーマシステムを実装。

- **ダークモード優先** - デフォルトで美しいダークテーマ
- **セマンティックカラー** - `bg-background`, `text-foreground` 等の統一された色変数
- **アクセシビリティ** - WCAG AAコントラスト基準を満たす配色

### コンポーネント

shadcn/uiをベースに、以下のようなカスタマイズを実施：

- **Glassmorphism効果** - モダンな半透明UI
- **スムーズアニメーション** - 洗練されたトランジション
- **レスポンシブ対応** - モバイルファーストデザイン

## 🔗 関連ドキュメント

- **ルートREADME** - プロジェクト全体の概要は [../README.md](../README.md) を参照
