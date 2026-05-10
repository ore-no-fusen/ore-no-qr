# デプロイ・テスト運用フロー

本プロジェクトでは、「開発したものが安心して本番に反映される」ことを保証するため、以下のワークフローを規定する。

---

## 担当の原則（最重要）

| 作業 | 担当 | 補足 |
|------|------|------|
| コミット（`git commit`） | **人間のみ** | AIは絶対に実行しない |
| プッシュ（`git push`） | **人間のみ** | AIは絶対に実行しない |
| バージョンタグ付け（`npm run release`） | **人間のみ** | リリース時に1回だけ |
| テスト実行（Playwright CI） | 機械が自動 | Push時に自動で走る |
| Vercelデプロイ | 機械が自動 | mainマージ時に自動 |

---

## ブランチ戦略

| ブランチ | 用途 |
|---------|------|
| `develop` | 日々の開発用（開発環境） |
| `main` | 本番公開用（本番環境） |

---

## ワークフロー図

```mermaid
graph TD
    subgraph PC_DEV ["💻 自PC / develop"]
        A[① 開発開始] --> B[② 実装・修正]
        B --> C{③ ローカルテスト}
        C -->|NG| B
        C -->|OK| D["④ コミット (VSCodeソース管理)"]
    end

    subgraph GH_DEV ["☁️ GitHub / develop"]
        E["⑤ Push (VSCodeソース管理)"]
        F[1️⃣ Vercelプレビュー生成]
        G{⑥ プレビュー確認}
        E --> F --> G
        G -->|NG| B
    end

    subgraph PC_REL ["💻 自PC / release"]
        H["⑦ npm run release (Terminal)"]
        I[2️⃣ Releaseノート・タグ自動作成]
        G -->|OK| H --> I
    end

    subgraph GH_PROD ["🚀 GitHub / main"]
        J["⑧ Pull Request (GitHub)"]
        K[3️⃣ 自動E2Eテスト]
        L["⑨ マージ承認 (GitHub)"]
        M((4️⃣ Vercel本番デプロイ))
        I --> J --> K
        K -->|NG| B
        K -->|OK| L --> M
    end

    D --> E

    classDef human fill:#1f2937,stroke:#374151,stroke-width:2px,color:#f3f4f6;
    classDef auto fill:#065f46,stroke:#047857,stroke-width:2px,color:#ffffff;

    class A,B,C,D,E,G,H,J,L human;
    class F,I,K,M auto;
```

---

## 機械が自動でやること

| # | トリガー | 内容 |
|---|------|------|
| 1️⃣ | developへPush時 | VercelがプレビューURLを自動生成 |
| 2️⃣ | `npm run release`実行時 | GitHubにReleaseノート・タグを自動作成 |
| 3️⃣ | Pull Request作成時 | GitHub ActionsがPlaywright自動テストを実行 |
| 4️⃣ | mainへマージ時 | Vercelが本番環境へ自動デプロイ |

> **Note:** `src/` や `tests/` 以外の変更（OGP画像・ドキュメントなど）ではテストはスキップされる。

---

## ⑦ バージョン付けの詳細（`npm run release`）

プレビュー確認で問題がなければ、Pull Requestを作る**前**にバージョン番号を付ける。

```bash
# 小さな修正・バグフィックス（例: 1.1.1 -> 1.1.2）
npm run release patch

# 新機能追加（例: 1.1.2 -> 1.2.0）
npm run release minor
```

実行すると「📝 リリースノートを入力してください」と聞かれる。入力してEnterを押すだけで、バージョン引き上げ・Push・GitHub Releasesへのノート作成が一撃で完了する。

その後、⑧〜⑨の通り **Pull Requestを作成し `main` へマージすると、本番環境の画面に新しいバージョンが反映される。**
