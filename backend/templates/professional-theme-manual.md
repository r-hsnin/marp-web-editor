<!-- _class: cover -->

# Professionalテーマ

## マニュアル

**高品質なスライドを効率的に作成**

---

## このマニュアルで学べること

- Professionalテーマの特徴
- 6つのレイアウトクラス
- 実践的な使用例
- カスタマイズのポイント

---

<!-- _class: section -->

# Professionalテーマとは？

**Marp defaultテーマをベースにした高機能テーマ**

---

## テーマの特徴

### 基本機能

- **背景画像対応** - 自動的に美しい背景を適用
- **6つのレイアウトクラス** - 用途に応じた最適なレイアウト
- **統一されたデザイン** - 一貫性のある見た目

### テーマの適用

テーマ選択で「professional」を選択するだけで利用可能

---

<!-- _class: section -->

# レイアウトクラス一覧

**6つの専用レイアウトで多様な表現**

---

<!-- _class: cover -->

# `cover` クラス

## 表紙スライド用

**プレゼンテーションの開始に**

使用方法: `<!-- _class: cover -->`

---

<!-- _class: columns -->

# coverクラスの特徴

<div class="columns-container">
  <div class="column-item">

### 用途

- プレゼンテーションの表紙
- セクションの大きな区切り

### 特徴

- 専用背景画像
- 中央配置レイアウト
- 大きなフォントサイズ

  </div>
  <div class="column-item">

### 記述例

```markdown
<!-- _class: cover -->

# メインタイトル

## サブタイトル

**発表者名**
```

### 使用場面

- プレゼン開始時
- 大きな話題転換時

  </div>
</div>

---

<!-- _class: section -->

# `section` クラス

**章・セクションの区切りに**

---

<!-- _class: columns -->

# sectionクラスの特徴

<div class="columns-container">
  <div class="column-item">

### 用途

- 話の大きな区切り
- 章タイトルの表示

### 特徴

- 中央配置
- 強調されたタイトル
- シンプルなレイアウト

  </div>
  <div class="column-item">

### 記述例

```markdown
<!-- _class: section -->

# セクションタイトル

**サブタイトル（任意）**
```

### 効果

- 話の流れを整理
- 聞き手の注意を引く

  </div>
</div>

---

<!-- _class: columns -->

# `columns` クラス

<div class="columns-container">
  <div class="column-item">

### 左カラム

- 2カラムレイアウト
- 比較・対比に最適
- 画像とテキストの組み合わせ

  </div>
  <div class="column-item">

### 右カラム

- 情報を整理して表示
- 図解と説明の並列
- 効率的なスペース活用

  </div>
</div>

---

<!-- _class: columns -->

# columnsクラスの使い方

<div class="columns-container">
  <div class="column-item">

### 必須HTML構造

```markdown
<!-- _class: columns -->

# スライドタイトル

<div class="columns-container">
  <div class="column-item">
    左カラムの内容
  </div>
  <div class="column-item">
    右カラムの内容
  </div>
</div>
```

  </div>
  <div class="column-item">

### 重要なポイント

- 各`<div>`タグの前後に空行が必要
- カラム内のフォントサイズは自動調整
- 画像サイズも自動制限

### 適用場面

- 比較・対比の説明
- 図解と文章の並列表示
- 情報の整理

  </div>
</div>

---

<!-- _class: image-center -->

# `image-center` クラス

## 画像を中央に配置

![サンプル画像](./images/shika_senbei.png)
**画像の説明やキャプション**

---

<!-- _class: columns -->

# image-centerクラスの特徴

<div class="columns-container">
  <div class="column-item">

### 用途

- ロゴや図の表示
- 画像中心のスライド
- キャプション付き画像

### 特徴

- 画像が中央配置
- 適切なサイズ制限
- キャプション対応

  </div>
  <div class="column-item">

### 記述例

```markdown
<!-- _class: image-center -->

# スライドタイトル

![代替テキスト](./images/shika_senbei.png)
**キャプション**
```

### サイズ制限

- 最大幅: 50%
- 最大高さ: 30vh

  </div>
</div>

---

<!-- _class: text-dense -->

# `text-dense` クラス

このクラスは通常よりも多くの情報を1枚のスライドに記載したい場合に使用します。フォントサイズと行間が調整されており、詳細な説明や補足情報、参考資料などを効率的に表示できます。

### 主な用途

- 技術的な詳細説明
- 手順の詳細記載
- 参考文献リスト
- 補足情報の提示

### 特徴

- フォントサイズ: 1.4em
- 行間: 1.6
- 読みやすさを保ちながら情報密度を向上

---

<!-- _class: card -->

# `card` クラス

<div class="card-container">
<div class="card-item">

### 機能A

- 高性能処理
- 直感的UI
- 豊富なオプション

</div>

<div class="card-item">

### 機能B

- リアルタイム同期
- クラウド対応
- マルチデバイス

</div>

<div class="card-item">

### 機能C

- 高度なセキュリティ
- 24時間サポート
- 定期アップデート

</div>
</div>

---

<!-- _class: columns -->

# cardクラスの使い方

<div class="columns-container">
  <div class="column-item">

### HTML構造

```markdown
<!-- _class: card -->

# スライドタイトル

<div class="card-container">
<div class="card-item">

### カードタイトル1

- 項目1
- 項目2

</div>
</div>
```

  </div>
  <div class="column-item">

### 特徴

- 影付きカードデザイン
- ホバーエフェクト
- 最大3つまで横並び

### 適用場面

- 機能・サービス紹介
- 比較表示
- 選択肢の提示

  </div>
</div>

---

<!-- _class: section -->

# 実践的な使い方

**効果的なスライド作成のコツ**

---

## レイアウトクラスの選び方

### スライドの目的に応じて選択

- **表紙・区切り**: `cover`, `section`
- **情報比較**: `columns`
- **画像中心**: `image-center`
- **詳細説明**: `text-dense`
- **機能紹介**: `card`

### 組み合わせ例

1. `cover` → `section` → `columns` → `section`
2. `cover` → `image-center` → `text-dense`

---

## カスタマイズのポイント

### 背景画像

- `images/background-default.png` - 通常スライド
- `images/background-cover.png` - 表紙スライド

### 色・フォント

- CSSカスタマイズで独自スタイル適用可能
- テーマファイルの編集で全体調整

---

<!-- _class: section -->

# まとめ

**Professionalテーマで高品質スライドを**

---

<!-- _class: columns -->

# 今日学んだこと

<div class="columns-container">
  <div class="column-item">

### 6つのレイアウトクラス

- `cover` - 表紙用
- `section` - 区切り用
- `columns` - 2カラム
- `image-center` - 画像中心
- `text-dense` - 詳細情報
- `card` - カード型

  </div>
  <div class="column-item">

### 効果的な使い方

- 目的に応じたクラス選択
- 適切な組み合わせ
- 統一感のあるデザイン

### 活用のポイント

- 情報量に応じてクラス選択
- 見やすさを重視
- 一貫性のあるスタイル

  </div>
</div>

---

# ご活用ください！

**Professionalテーマで素晴らしいスライドを作成しましょう**
