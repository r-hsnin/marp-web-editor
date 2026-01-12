# AI 機能検証スクリプト

対話型の AI 機能検証ツール。

## 使い方

```bash
cd backend

# 基本的な対話
bun run ai-eval/chat.ts "メッセージ"

# 会話をリセット（テーマ指定可）
bun run ai-eval/chat.ts --reset [theme]

# 会話履歴を表示
bun run ai-eval/chat.ts --show

# propose_* を自動で context に適用
bun run ai-eval/chat.ts --auto-apply "スライドを作成して"

# context を直接更新
bun run ai-eval/chat.ts --context "# 新しい内容"

# 最後の propose_replace を適用
bun run ai-eval/chat.ts --apply
```

## ファイル

| ファイル | 説明 |
|----------|------|
| chat.ts | 対話型テストスクリプト |
| conversation.json | 会話履歴（自動生成） |
| EVAL-PROMPT.md | 検証項目の詳細 |

## 検証例

```bash
# 構成案 → 修正 → 作成 の流れ
bun run ai-eval/chat.ts --reset midnight
bun run ai-eval/chat.ts "セキュリティ研修の構成案を考えて"
bun run ai-eval/chat.ts "5枚に絞って"
bun run ai-eval/chat.ts --auto-apply "この構成でスライドを作成して"
bun run ai-eval/chat.ts "レビューして"
```
