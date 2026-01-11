# プロンプト設計ガイド

Marp Web Editor の AI プロンプト設計方針と採用している最適化手法。

---

## 設計原則

### 1. XMLタグによる構造化

Claude / Gemini 両モデルで効果的な構造化手法。

```xml
<role>エージェントの役割定義</role>
<tools>利用可能なツール</tools>
<constraints>制約条件</constraints>
<output_format>出力形式</output_format>
<examples>Few-shot例</examples>
<guidelines>ガイドライン</guidelines>
<current_presentation>コンテキスト</current_presentation>
<final_instruction>最終指示</final_instruction>
```

### 2. 肯定形指示

否定形は「ピンクの象問題」を引き起こす可能性があるため、肯定形を優先。

| 避ける | 採用 |
|--------|------|
| "Don't include frontmatter" | "Omit frontmatter" |
| "Do NOT use ---" | "Single slide content (without --- separator)" |
| "Avoid generic titles" | "Use specific, engaging titles" |

**例外**: ハードな制約（倫理・安全性）には否定形が効果的。

### 3. Few-shot 例の提供

各エージェントに 3 個以上の具体例を含める。

```xml
<examples>
<example>
User: "スライド2を短くして"
Action: Call propose_edit with slideIndex: 1
</example>
</examples>
```

### 4. 出力フォーマットの明示

期待する出力形式を明確に指定。

```xml
<output_format>
1. Tool call(s) - Required
2. Brief explanation in user's language (1-2 sentences)
</output_format>
```

### 5. 最終指示の配置

プロンプト末尾に最終指示を配置（両モデルで推奨）。

```xml
<final_instruction>
Complete the user's request using the appropriate approach.
Respond in the same language as the user's input.
</final_instruction>
```

---

## プロンプト構成

### システムプロンプトの構造

```
<role>
<tools> / <capabilities>
<tool_selection>        ← editor のみ
<constraints>
<default_to_action>     ← editor のみ
<output_format>
<examples>
<guidelines>            ← base-rules.md
<theme>                 ← テーマガイドライン（editor/general）
<current_presentation>  ← コンテキスト
<final_instruction>
```

### エージェント別の特徴

| エージェント | ツール | 特徴 |
|-------------|--------|------|
| **Orchestrator** | なし | Intent分析、ルーティング |
| **Architect** | propose_plan | 構成提案、計画立案 |
| **Editor** | propose_edit/insert/replace | スライド作成・編集 |
| **General** | なし | 質問応答、ガイダンス |

---

## ガイドライン設計

### base-rules.md

Marp スライド作成の基本ルール。

- **構造**: Slide Structure → Formatting → Best Practices
- **表現**: 肯定形を優先（Quality Checklist）
- **例示**: ✗/✓ 形式で具体例を提示

### テーマガイドライン

カスタムテーマ用のクラス定義。

```markdown
### cover
Use for: Title page, opening slide

### section
Use for: Chapter dividers, topic transitions
Required: Empty lines after opening `<div>`
```

- `Use for:` で用途を明示
- `Required:` で技術的制約を記載
- コード例を含める

---

## ツール定義

### description の原則

- 簡潔に目的を伝える
- 否定形を避ける
- パラメータの形式は describe() で定義

```typescript
// Good
description: 'Edit a specific existing slide. Call once per slide.'
newMarkdown: 'Single slide markdown (without --- separator)'

// Avoid
description: 'Propose edits to a specific slide. Do NOT include ---.'
```

---

## モデル別の考慮事項

### Claude Sonnet 4

- XMLタグに特に敏感
- 明示的な指示が必要（"suggest" vs "implement"）
- `<default_to_action>` でツール使用を促進

### Gemini 3 Flash

- 直接的で簡潔な指示を好む
- 一貫した構造（XML or Markdown、混在しない）
- 指示は末尾に配置

### 共通

- Few-shot 例が効果的
- 肯定形指示が効果的
- 出力フォーマットの明示が効果的

---

## 参考資料

- [AI.md](./AI.md) - AI機能のアーキテクチャ
- [AI-EVAL.md](./AI-EVAL.md) - 評価環境
