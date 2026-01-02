# AI 評価環境

Promptfoo を使用した AI 機能の E2E 評価環境。

---

## 概要

backend の `/api/ai/chat` を直接呼び出し、実際のシステム全体を評価する。

### 評価項目

| カテゴリ | 評価内容 |
|----------|----------|
| Intent 分析 | orchestrator が正しいエージェントにルーティングするか |
| ツール呼び出し | 適切なツール（propose_edit, propose_insert 等）が呼ばれるか |
| 会話履歴 | 複数ターンの会話でコンテキストを保持できるか |
| Markdown 品質 | 生成されたスライドがガイドラインに準拠しているか |

---

## セットアップ

```bash
cd eval
bun install
```

---

## 実行方法

```bash
# backend を起動（別ターミナル）
cd backend && bun run dev

# 評価実行
cd eval && bun run eval

# 結果を WebUI で確認
bun run eval:view
```

### 環境変数

| 変数 | デフォルト | 説明 |
|------|-----------|------|
| API_BASE_URL | http://localhost:3001 | backend の URL |

---

## ディレクトリ構成

```
eval/
├── package.json
├── promptfooconfig.yaml    # Promptfoo 設定
├── providers/
│   └── backend-api.ts      # API 呼び出しプロバイダー
└── tests/
    ├── intent/             # Intent 分析テスト
    │   └── basic.yaml
    ├── tools/              # ツール呼び出しテスト
    │   ├── editor.yaml
    │   └── architect.yaml
    ├── conversation/       # 会話履歴テスト
    │   └── multi-turn.yaml
    └── quality/            # Markdown 品質テスト
        └── markdown.yaml
```

---

## テストケースの書き方

### 基本構造

```yaml
- description: テストの説明
  vars:
    userMessage: "ユーザーの入力"
    context: "[0] # スライド1\n\n[1] ## スライド2"
    theme: "default"  # オプション
    history:          # オプション: 会話履歴
      - role: "user"
        content: "前のメッセージ"
      - role: "assistant"
        content: "前の応答"
  assert:
    - type: is-json
    - type: javascript
      value: |
        const result = JSON.parse(output);
        return result.intent === 'editor';
```

### 変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `userMessage` | ✅ | ユーザーの入力メッセージ |
| `context` | - | 現在のスライド内容（`[index] content` 形式） |
| `theme` | - | 使用するテーマ名 |
| `history` | - | 会話履歴（`role` と `content` の配列） |

### 出力形式

プロバイダーは以下の JSON を返す:

```json
{
  "intent": "editor",
  "toolCalls": [
    { "name": "propose_edit", "args": { "slideIndex": 0, "newMarkdown": "...", "reason": "..." } }
  ],
  "textContent": "テキスト応答"
}
```

### アサーション例

```yaml
# Intent の検証
- type: javascript
  value: JSON.parse(output).intent === 'editor'

# ツール呼び出しの検証
- type: javascript
  value: |
    const result = JSON.parse(output);
    return result.toolCalls?.some(t => t.name === 'propose_replace');

# Markdown 品質の検証
- type: javascript
  value: |
    const result = JSON.parse(output);
    const call = result.toolCalls?.find(t => t.name === 'propose_replace');
    if (!call) return false;
    const markdown = call.args?.newMarkdown || '';
    return markdown.includes('---');  // スライド区切りがあるか
```

---

## 参考資料

- [Promptfoo Documentation](https://promptfoo.dev/docs/)
- [AI 機能ドキュメント](./AI.md)
