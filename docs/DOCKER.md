# Docker 環境構築

Docker でのクイックスタートとトラブルシューティング。

---

## クイックスタート

```bash
# 環境変数を設定（AI機能を使う場合）
cp backend/.env.example backend/.env

# ビルド & 起動
docker-compose up --build
```

http://localhost:3000 でアクセス

---

## 構成

| コンテナ | ベースイメージ | ポート |
|---------|---------------|--------|
| frontend | nginx:alpine | 3000 |
| backend | oven/bun:1-slim | 3001 |

Backend には Node.js（Marp CLI 用）、Chromium、日本語フォントが含まれます。

---

## 使用方法

```bash
docker-compose up --build        # ビルドして起動
docker-compose up -d --build     # バックグラウンド起動
docker-compose logs -f           # ログ確認
docker-compose down              # 停止
```

---

## トラブルシューティング

### 日本語が表示されない

```bash
docker-compose exec backend fc-list :lang=ja
```

### Chromium が起動しない

ログを確認:
```bash
docker-compose logs backend
```

### キャッシュ問題

Dockerfile 変更後は `--no-cache` でビルド:
```bash
docker-compose build --no-cache
```

---

## 関連ドキュメント

- [ARCHITECTURE.md](./ARCHITECTURE.md) - システム設計・技術スタック
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発環境構築
- [AI.md](./AI.md) - AI機能の実装
