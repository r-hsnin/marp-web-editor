---
marp: true
theme: midnight
---

<!-- _class: cover -->

# Midnight テーマ

## マニュアル

**コードが映えるダークテーマ**

---

## このマニュアルで学べること

- Midnightテーマの特徴
- 5つのレイアウトクラス
- コード表示のベストプラクティス

---

<!-- _class: highlight -->

# Midnightテーマとは？

**エンジニアのためのダークテーマ**

---

<!-- _class: split -->

# テーマの特徴

<div class="left">

### コードファースト設計

- **ダークモード**
  目に優しく長時間でも疲れにくい
- **シンタックスハイライト**
  GitHub Dark風の配色
- **Auto-scaling**
  長いコードも自動でフィット

</div>

<div class="right">

### 5つのクラス

| クラス | 用途 |
|--------|------|
| `cover` | 表紙 |
| `code-focus` | コード主役 |
| `terminal` | CLI風 |
| `split` | 2カラム |
| `highlight` | 強調 |

</div>

---

<!-- _class: highlight -->

# cover

**表紙スライド**

---

<!-- _class: cover -->

# `cover` クラス

## 表紙スライド

**グラデーション背景でインパクトを**

---

## coverクラスの使い方

```
<!-- _class: cover -->

# タイトル
## サブタイトル
**発表者名**
```

用途: プレゼンの表紙、大きな区切り

---

<!-- _class: highlight -->

# code-focus

**コードを主役に**

---

<!-- _class: code-focus -->

# `code-focus` - コードを主役に

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

---

<!-- _class: code-focus -->

# `code-focus` - 長いコードも自動縮小

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

type User = z.infer<typeof userSchema>;

const app = new Hono();

app.post('/users', zValidator('json', userSchema), async (c) => {
  const data = c.req.valid('json');
  const user: User = { ...data, id: crypto.randomUUID() };
  return c.json(user, 201);
});

app.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  return c.json({ id, name: 'Alice', email: 'alice@example.com' });
});

export default app;
```

---

## code-focusクラスの使い方

```
<!-- _class: code-focus -->

# 短いタイトル

（コードブロック）

説明文（任意）
```

用途: コード紹介、API例、実装サンプル

---

<!-- _class: highlight -->

# terminal

**ターミナル風スライド**

---

<!-- _class: terminal -->

# npm run build

```
$ npm install
added 1423 packages in 12s

$ npm run build
vite v5.0.0 building for production...
✓ 142 modules transformed.
✓ built in 2.34s
```

---

## terminalクラスの使い方

```
<!-- _class: terminal -->

# コマンド名

（出力結果）
```

- H1が `$ コマンド名` として表示される
- 黒背景・緑文字のターミナル風デザイン

---

<!-- _class: highlight -->

# split

**2カラムレイアウト**

---

<!-- _class: split -->

# `split` クラス

<div class="left">

### Before

```python
# 手続き的な書き方
def get_user(id):
    conn = connect()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE id = ?",
        (id,)
    )
    row = cursor.fetchone()
    conn.close()
    return row
```

</div>
<div class="right">

### After

```python
# データクラスを使った書き方
@dataclass
class User:
    id: int
    name: str
    email: str

async def get_user(id: int) -> User:
    async with db.connection() as conn:
        row = await conn.fetchone(
            "SELECT * FROM users WHERE id = $1", id
        )
        return User(**row)
```

</div>

---

## splitクラスの使い方

```
<!-- _class: split -->
# タイトル

<div class="left">
左側
</div>
<div class="right">
右側
</div>
```

**重要**: `<div>`タグの前後に空行が必須

---

<!-- _class: highlight -->

# highlight

**キーメッセージを強調**

---

## highlightクラスの使い方

```
<!-- _class: highlight -->

# キーメッセージ

**強調したい内容**
```

用途: 重要ポイント、セクション区切り、結論

---

<!-- _class: highlight -->

# まとめ

**Midnightテーマでコードを魅せよう**

---

<!-- _class: cover -->

# Enjoy Coding! 🚀

**Midnightテーマで技術プレゼンを**
