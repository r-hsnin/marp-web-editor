# ロギング基盤導入タスク

## 背景

現状、Backend/Frontend ともに `console.*` を直接使用しており、以下の問題がある：
- ログレベルの制御ができない
- 本番環境で不要なログが出力される
- 構造化されておらず、問題調査が困難

## 目的

- 開発時: 詳細なログで動作理解・デバッグを支援
- 本番時: 重要なイベントのみ出力し、ノイズを削減
- 問題発生時: 原因切り分けを容易にする

## 採用ライブラリ

| 環境 | ライブラリ | 理由 |
|------|-----------|------|
| Backend | pino | 構造化ログ、高速、Bun 対応、Node.js エコシステムで標準的 |
| Frontend | loglevel | 軽量 (~1.5KB)、ログレベル制御、localStorage で動的変更可能 |

※ 環境が異なるため、それぞれに最適なライブラリを採用

## ログレベル定義

| レベル | いつ使うか | 例 |
|--------|-----------|-----|
| error | 処理が失敗し、ユーザーに影響がある | API エラー、エクスポート失敗 |
| warn | 問題だが処理は継続できる | 無効なテーマ名でデフォルト使用 |
| info | 正常な重要イベント | サーバー起動、リクエスト完了 |
| debug | 開発時のみ必要な詳細 | 引数の値、内部状態、処理フロー |

## 環境別ログレベル

| 環境 | Backend | Frontend |
|------|---------|----------|
| 開発 (NODE_ENV=development) | debug | debug |
| 本番 (NODE_ENV=production) | info | warn |

## ログポイント設計

### Backend

| カテゴリ | ログポイント | レベル | 内容 |
|----------|-------------|--------|------|
| ライフサイクル | サーバー起動 | info | ポート番号、環境 |
| リクエスト | 受信/完了 | info | メソッド、パス、ステータス、処理時間 |
| エラー | 例外発生 | error | エラーメッセージ、スタックトレース (debug のみ) |
| 外部連携 | AI API 呼び出し | debug | プロバイダー、モデル |
| 外部連携 | Marp CLI 実行 | debug | コマンド引数 |
| ビジネス | エクスポート | info | フォーマット、テーマ |

### Frontend

| カテゴリ | ログポイント | レベル | 内容 |
|----------|-------------|--------|------|
| エラー | API 呼び出し失敗 | error | エンドポイント、エラー内容 |
| エラー | レンダリング失敗 | error | エラー内容 |
| 警告 | フォールバック動作 | warn | 何にフォールバックしたか |
| デバッグ | 状態変更 | debug | 変更内容 |

## 機密情報の扱い

| データ | 扱い |
|--------|------|
| API キー | ログ禁止 |
| Markdown 内容 | ログ禁止（長い、個人情報の可能性） |
| テーマ名、フォーマット | ログ可 |
| エラーメッセージ | ログ可 |
| スタックトレース | debug レベルのみ |

## 実装方針

### Backend

1. `pino` をインストール
2. `backend/src/lib/logger.ts` を作成
3. Hono の pino middleware (`hono-pino`) でリクエストログを自動化
4. 既存の `console.*` を `logger.*` に置換
5. 環境変数 `LOG_LEVEL` でレベル制御

### Frontend

1. `loglevel` をインストール
2. `frontend/src/lib/logger.ts` を作成
3. 既存の `console.*` を `logger.*` に置換
4. `import.meta.env.PROD` でデフォルトレベルを設定

## 実装時の考え方

### 既存の console.* について

既存の `console.*` は「現状の参考」であり、そのまま置換対象ではない。

各箇所で以下を判断する：
1. **このログは必要か？** → 不要なら削除
2. **ログレベルは適切か？** → ログポイント設計に基づいて決定
3. **ログ内容は十分か？** → 問題調査に必要な情報が含まれているか

### 新規ログの追加

ログポイント設計に基づき、現状ログがない箇所でも必要なら追加する。

例：
- リクエスト完了時の処理時間（現状なし → 追加）
- AI エージェントの選択結果（現状なし → 追加検討）

### 判断基準

「このログがないと、問題発生時に何が困るか？」を考える。
- 困らない → 不要（削除または追加しない）
- 困る → 必要（適切なレベルで出力）

---

## 実装例

### Backend

#### 1. backend/src/lib/logger.ts（新規）

```typescript
import pino from 'pino';

export const logger = pino({
  level: Bun.env.LOG_LEVEL || (Bun.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport:
    Bun.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
```

#### 2. backend/src/index.ts

```typescript
import { logger } from './lib/logger.js';
import app from './app.js';

const port = Number(Bun.env.PORT) || 3001;

// info: サーバー起動は重要イベント
logger.info({ port, url: Bun.env.APP_BASE_URL || `http://localhost:${port}` }, 'Server started');

export default {
  fetch: app.fetch,
  port,
  idleTimeout: 60,
};
```

#### 3. backend/src/app.ts

```typescript
import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { logger } from './lib/logger.js';
// ... other imports

const app = new Hono();

// リクエストログを自動化（メソッド、パス、ステータス、処理時間）
app.use(pinoLogger({ pino: logger }));

// ... rest of the file
```

#### 4. backend/src/routes/export.ts

```typescript
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { type ExportFormat, marpConverter } from '../lib/marp.js';
import { exportSchema } from '../schemas/export.js';
import { logger } from '../lib/logger.js';

const exportRoute = new Hono();

exportRoute.post('/', zValidator('json', exportSchema), async (c) => {
  // 削除: リクエストログは middleware で出る
  // console.log('Received export request');

  const { markdown, format, theme } = c.req.valid('json');

  // debug: 開発時のパラメータ確認用
  logger.debug({ format, theme }, 'Export started');

  try {
    const buffer = await marpConverter.convert({
      markdown,
      format: format as ExportFormat,
      theme,
    });

    // ... response handling

    return c.body(buffer as unknown as ArrayBuffer);
  } catch (error) {
    // error: エクスポート失敗はユーザー影響あり
    logger.error({ err: error, format, theme }, 'Export failed');
    return c.json({ error: 'Failed to generate export' }, 500);
  }
});

export default exportRoute;
```

#### 5. backend/src/lib/ai/orchestrator.ts

```typescript
import { logger } from '../logger.js';
// ... other imports

export const orchestrator = {
  async run(messages: ModelMessage[], context: string, theme?: string): Promise<Response> {
    try {
      const { object: { intent } } = await generateObject({ /* ... */ });

      // debug: Intent 分析結果（開発時のデバッグ用）
      logger.debug({ intent, theme, messageCount: messages.length }, 'Intent analyzed');

      // ... routing logic

      response.headers.set('X-Agent-Intent', intent);
      return response;
    } catch (error) {
      // error: AI 処理失敗はユーザー影響あり
      logger.error({ err: error }, 'Orchestrator failed');
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: 'AI processing failed', details: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
```

---

### Frontend

#### 1. frontend/src/lib/logger.ts（新規）

```typescript
import log from 'loglevel';

// 本番: warn 以上、開発: debug 以上
log.setLevel(import.meta.env.PROD ? 'warn' : 'debug');

export const logger = log;
```

#### 2. frontend/src/lib/api.ts

```typescript
import { logger } from './logger';
// ... other imports

export const exportSlide = async (
  markdown: string,
  format: ExportFormat,
  theme?: string,
): Promise<void> => {
  const response = await client.api.export.$post({
    json: { markdown, format, theme },
  });

  if (!response.ok) {
    // error: エクスポート失敗はユーザー影響大
    logger.error(`Export failed: ${response.status} ${response.statusText}`);
    throw new Error(`Export failed: ${response.statusText}`);
  }

  // ... download handling (ログ不要)
};

export const fetchThemes = async (): Promise<string[]> => {
  try {
    const response = await client.api.themes.$get();
    if (!response.ok) {
      throw new Error('Failed to fetch themes');
    }
    const data = await response.json();
    return data.themes;
  } catch (error) {
    // warn: テーマ取得失敗はフォールバック可能（空配列を返す）
    logger.warn(`Failed to fetch themes: ${error instanceof Error ? error.message : error}`);
    return [];
  }
};

// fetchTemplates, fetchTemplate も同様のパターン
```

#### 3. frontend/src/hooks/useMarp.ts

```typescript
import { logger } from '../lib/logger';
// ... other imports

export const useMarp = (markdown: string) => {
  // ... state declarations

  const marp = useMemo(() => {
    const instance = new Marp({ /* ... */ });

    if (loadedCss) {
      try {
        const addedTheme = instance.themeSet.add(loadedCss);
        instance.themeSet.default = addedTheme;
      } catch (e) {
        // warn: テーマ適用失敗だがデフォルトで継続可能
        logger.warn(`Failed to apply theme, using default: ${e instanceof Error ? e.message : e}`);
      }
    }
    // ...
    return instance;
  }, [loadedCss, isLoading, activeThemeId]);

  useEffect(() => {
    // ...
    try {
      const { html, css, comments } = marp.render(markdown);
      setHtml(html);
      setCss(css);
      setComments(comments);
    } catch (e) {
      // error: レンダリング失敗はユーザーに影響
      logger.error(`Marp rendering failed: ${e instanceof Error ? e.message : e}`);
    }
  }, [markdown, marp, isLoading]);

  return { html, css, comments, isLoading };
};
```

---

## ライブラリ API リファレンス

### pino (Backend)

```typescript
// 基本
logger.info('message');
logger.debug('message');
logger.warn('message');
logger.error('message');

// コンテキスト付き（推奨）
logger.info({ key: 'value' }, 'message');
logger.error({ err: error, context: 'value' }, 'error message');
```

### loglevel (Frontend)

```typescript
// 基本（引数は1つのみ）
logger.trace(msg);
logger.debug(msg);
logger.info(msg);
logger.warn(msg);
logger.error(msg);

// エラーオブジェクトを含める場合
logger.error(`Operation failed: ${error.message}`);
```

---

# AI エージェント向け作業指示

## 前提条件

- 作業前に `git checkout main && git pull origin main` で最新化すること
- 新しいブランチ `feat/logging-infrastructure` を作成してから作業を開始すること

## 作業手順

### 1. 現状調査

- 上記の変更対象ファイルを読み込み、現在のログ出力を把握する
- 公式ドキュメント（Context7 の querydocs）で pino, loglevel の使い方を確認する

### 2. 仕様確認（重要）

- 推測で実装を進めない
- 不明点があれば確認する
- 「なぜこのログが必要か」を説明できない場合は、そのログは不要

### 3. 問題の自己検証

以下の観点で検証し、確実な問題のみ対応する：
- 「なぜ問題か？」- 具体的な理由を説明できるか
- 「本当に問題か？」- 動作に影響があるか
- 「どうやって確認するか？」- 変更前後で検証可能か

### 4. 変更の実施

- 論理的な単位でコミットを分離する
- 各コミットは以下の形式で記述：
  ```
  <type>(<scope>): <subject>

  - 変更点1
  - 変更点2
  ```
- type: feat, fix, refactor

### 5. 検証

- `bun run typecheck` - 型チェック
- `bun run check` - Biome lint/format
- `bun run build` - ビルド確認
- 開発サーバーを起動し、ログ出力を確認

### 6. PR 作成

- ブランチ名: `feat/logging-infrastructure`
- PR 本文に概要・変更内容・検証結果を記載

## 注意事項

- 単純に見える置換でも、ログレベルが適切か確認する
- 既存のログが本当に必要か検討し、不要なら削除する
- 新たに必要なログポイントがあれば追加する
- git 操作前に `git status` で状態を確認する
