# CLAUDE.md

このファイルはリポジトリ内のコードを扱う際に Claude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

```bash
pnpm dev                          # 開発サーバー起動
pnpm build                        # プロダクションビルド
pnpm dlx prisma migrate dev       # DBマイグレーション実行
pnpm dlx prisma generate          # schema.prisma 変更後に Prisma クライアントを再生成
pnpm dlx prisma studio            # Prisma Studio（DBブラウザ）起動
```

テストスイートは未設定。

## アーキテクチャ概要

**ツミホビ** は Next.js 16 (App Router) で構築したゲーム・アニメ・本のバックログ管理アプリ。Google OAuth で認証し、外部 API を検索してメディアの消化状況を管理する。

### ルート構成

```
src/app/
├── (main)/          # 認証必須ルート — layout.tsx でサーバーサイド認証チェック
│   ├── page.tsx     # ダッシュボード（統計・グラフ）
│   ├── backlog/     # バックログ一覧（フィルタリングあり）
│   └── search/      # マルチタイプ検索 + バックログ追加
├── (auth)/login/    # Google OAuth ログイン画面
└── api/             # REST エンドポイント: /backlog, /backlog/[id], /search, /stats
```

### Prisma 7 の重要な規約

- インポートは `@/generated/prisma/client`（`@prisma/client` ではない）
- `PrismaClient` は PG アダプターが必須 — シングルトンパターンは `src/lib/prisma.ts` を参照（`@prisma/adapter-pg` 使用）
- `schema.prisma` を変更したら必ず `pnpm dlx prisma migrate dev` → `pnpm dlx prisma generate` を実行

### データモデル

中心モデルは `BacklogItem`:
- `type`: `GAME | ANIME | BOOK`
- `status`: `BACKLOG | IN_PROGRESS | COMPLETED | DROPPED`
- ユニーク制約 `[userId, externalId, type]` — POST `/api/backlog` は重複防止のため upsert を使用
- タイプ別のnullable フィールド: `clearTimeMinutes`（ゲーム）、`totalEpisodes`/`currentEpisode`（アニメ）、`totalPages`/`currentPage`（本）

### 外部 API

| タイプ | サービス     | 認証     | 環境変数       |
|--------|-------------|----------|----------------|
| GAME   | RAWG.io     | API キー | `RAWG_API_KEY` |
| ANIME  | Jikan v4    | なし     | —              |
| BOOK   | Open Library| なし     | —              |

3つすべて `src/types/index.ts` に定義された `SearchResult` 型に正規化して返す。

### UI 規約

- ユーザー向けテキストはすべて日本語
- `src/types/index.ts` の `TYPE_LABELS`、`STATUS_LABELS`、`TYPE_COLORS`、`STATUS_COLORS` 定数が表示文字列・色の唯一の参照先
- トーストは `sonner` を使用 — shadcn の `toast` コンポーネントは非推奨
- Tailwind v4 の設定は `src/app/globals.css` の CSS カスタムプロパティ（oklch カラースペース）で完結。`tailwind.config.js` は存在しない
- shadcn/ui は `new-york` スタイル。`@/components/ui/` からインポートする

### 認証

NextAuth v5 beta は `src/lib/auth.ts` で設定。セッションは `user.id` を追加拡張済み（`src/types/next-auth.d.ts` 参照）。`(main)` 配下のすべてのルートは `src/app/(main)/layout.tsx` でサーバーサイドの認証チェックを行う。

### 必要な環境変数

```
DATABASE_URL=           # Supabase PostgreSQL 接続文字列
AUTH_SECRET=            # openssl rand -base64 32 で生成
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAWG_API_KEY=           # rawg.io に無料登録して取得
```
