# Logging Strategy

ロギング基盤の設計と実装ガイド。

---

## 目的

- **開発時**: 問題調査・デバッグを支援
- **本番時**: 重要なイベントのみ出力し、ノイズを削減
- **問題発生時**: 原因切り分けを容易にする

---

## 採用ライブラリ

| 環境 | ライブラリ | 理由 |
|------|-----------|------|
| Backend | pino | 構造化ログ、高速、Bun 対応 |
| Frontend | loglevel | 軽量 (~1.5KB)、ログレベル制御 |

---

## ログレベル定義

| レベル | いつ使うか | 例 |
|--------|-----------|-----|
| error | 処理が失敗し、ユーザーに影響がある | API エラー、エクスポート失敗 |
| warn | 問題だが処理は継続できる | テーマ未発見でデフォルト使用 |
| info | 正常な重要イベント | サーバー起動、エクスポート完了 |

※ debug レベルは使用しない（info/warn/error で十分）

---

## 環境別デフォルトレベル

| 環境 | Backend | Frontend |
|------|---------|----------|
| 開発 (NODE_ENV=development) | info | info |
| 本番 (NODE_ENV=production) | info | warn |

---

## Backend ログポイント

### ライフサイクル

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| サーバー起動 | info | port, url, env |

```typescript
logger.info({ port, url, env }, 'Server started');
```

### リクエスト処理

hono-pino middleware で自動化。

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| リクエスト完了 | info | method, path, status, duration |

### エクスポート

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 成功 | info | format, theme, durationMs |
| 失敗 | error | err, format, theme |

```typescript
logger.info({ format, theme, durationMs }, 'Export completed');
logger.error({ err, format, theme }, 'Export failed');
```

### Marp CLI

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 失敗 | error | exitCode, stdout, stderr |
| テーマ警告 | warn | theme, reason |

```typescript
logger.error({ exitCode, stdout, stderr }, 'Marp CLI failed');
logger.warn({ theme, reason: 'invalid name' }, 'Invalid theme');
logger.warn({ theme, path }, 'Theme file not found');
```

### AI

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 処理失敗 | error | err |

```typescript
logger.error({ err }, 'AI processing failed');
```

### テーマ

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 一覧取得失敗 | warn | err |
| 読み込み失敗 | warn | theme, err |

```typescript
logger.warn({ err }, 'Failed to list themes');
logger.warn({ theme, err }, 'Failed to load theme');
```

### テンプレート

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 一覧取得失敗 | warn | err |
| 読み込み失敗 | warn | template, err |

```typescript
logger.warn({ err }, 'Failed to list templates');
logger.warn({ template, err }, 'Failed to load template');
```

### 画像

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| アップロード失敗 | error | err |

```typescript
logger.error({ err }, 'Image upload failed');
```

### プロンプトビルダー

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| ガイドライン失敗 | warn | file |

```typescript
logger.warn({ file: 'base-rules.md' }, 'Failed to load guideline');
logger.warn({ theme }, 'No guideline found for theme');
```

---

## Frontend ログポイント

### API

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| エクスポート失敗 | error | error message |
| テーマ取得失敗 | warn | error message |
| テンプレート取得失敗 | warn | error message |

```typescript
logger.error('Export failed:', error);
logger.warn('Failed to fetch themes:', error);
logger.warn('Failed to fetch templates:', error);
```

### Marp レンダリング

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| テーマ適用失敗 | warn | error message |
| レンダリング失敗 | error | error message |

```typescript
logger.warn('Failed to apply theme:', error);
logger.error('Marp rendering failed:', error);
```

### テーマローダー

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| 読み込み失敗 | warn | themeId, error message |

```typescript
logger.warn(`Failed to load theme ${themeId}:`, error);
```

### チャット

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| エラー | error | error message |

```typescript
logger.error('Chat error:', error);
```

### フロントマター

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| パース失敗 | warn | error message |

```typescript
logger.warn('Failed to parse frontmatter:', error);
```

### スライド

| ログポイント | レベル | 内容 |
|-------------|--------|------|
| パース失敗 | warn | error message |

```typescript
logger.warn('Failed to parse slides:', error);
```

---

## 機密情報の扱い

| データ | 扱い |
|--------|------|
| API キー | ログ禁止 |
| Markdown 内容 | ログ禁止 |
| テーマ名、フォーマット | ログ可 |
| エラーメッセージ | ログ可 |

---

## 設計判断の記録

### debug レベルを使用しない理由

以下の候補を検討し、全て不要と判断:

| 候補 | 判断理由 |
|------|----------|
| エクスポート開始 | 成功/失敗ログで format, theme が出る |
| Marp CLI 実行コマンド | 失敗時の error ログで十分 |
| Marp CLI ブラウザパス | 環境変数で確認可能 |
| AI Intent 分析結果 | Response ヘッダー `X-Agent-Intent` で確認可能 |

### error vs warn の判断基準

- **error**: ユーザーに影響がある（操作が失敗する）
- **warn**: フォールバック可能（デフォルト値を使用して継続）

例:
- テーマ読み込み失敗 → デフォルトテーマで継続可能 → warn
- エクスポート失敗 → ユーザーの操作が失敗 → error

---

## 実装ファイル

| ファイル | 内容 |
|----------|------|
| `backend/src/lib/logger.ts` | pino インスタンス |
| `frontend/src/lib/logger.ts` | loglevel インスタンス |

---

## 環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `LOG_LEVEL` | Backend ログレベル | info |
| `NODE_ENV` | 環境判定 | development |
