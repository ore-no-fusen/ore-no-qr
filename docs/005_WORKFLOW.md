# デプロイ・テスト運用フロー

本プロジェクトでは、「開発したものが安心して本番に反映される」ことを保証するため、以下の4ステップのワークフローを規定する。

## ブランチ戦略
- `develop` ブランチ： 日々の開発用（開発環境）
- `main` ブランチ： 本番公開用（本番環境）

---

## 基本ワークフロー

### ① 開発 (Development)
新機能の追加やバグ修正、UI変更などの開発作業は、必ずローカル環境（`develop` ブランチ）で行う。

### ② 開発環境でのテスト → コミット
ローカルでの実装が完了したら、PlaywrightによるE2E自動テストを実行する。
```bash
npm run test:e2e
```
テストが全て（ビジュアルのズレがないか、機能が壊れていないか）パスしたことを確認してから `develop` ブランチにコミット＆プッシュする。

### ③ 本番相当（プレビュー）でのテスト → 修正
`develop` ブランチをPushすると、Vercelが自動的に「プレビュー用URL（本番と全く同じ仕組みのテスト用サーバー）」を発行する。
このプレビューURLに対して、最終確認（動作確認・テスト）を行う。
もしここで不具合が見つかった場合は、`develop` ブランチで修正コミットを行う。
（※緊急で `main` ブランチに直接修正を入れた場合は、必ず後で `develop` ブランチへ `git pull` して同期させる）

### ④ 本番リリース (Production)
プレビュー環境で完全に問題がない（安心して出せる）ことが確認できたら、GitHub上で `develop` ブランチから `main` ブランチへマージ（Pull Request）を行う。
Vercelが自動で `main` ブランチの変更を検知し、安全に本番環境へリリースする。

---

## 自動化（CI/CD）の導入

GitHub Actions（`.github/workflows/playwright.yml`）を設定し、「コミットした瞬間に自動でPlaywrightが走り、テストに落ちたコードは本番にマージできない」仕組み（CI）を構築済み。

```mermaid
graph TD
    %% 凡例
    subgraph Legend [作業の担当]
        L1[① 人間がやること]
        L2[1️⃣ 機械が自動でやること]
    end

    A[① 開発開始] --> B(② developブランチで実装)
    B --> C{③ ローカルE2Eテスト}
    C -->|NG| B
    C -->|OK| D[④ developへPush]
    D --> E[1️⃣ Vercelプレビュー環境生成]
    E --> F{⑤ 実機プレビュー確認}
    F -->|NG| B
    F -->|OK| G[⑥ mainへPull Request]
    G --> H[2️⃣ GitHub Actions: 自動E2Eテスト]
    H -->|NG| B
    H -->|OK| I[⑦ mainへマージ承認]
    I --> J((3️⃣ Vercel 本番自動リリース))
    J --> K[⑧ バージョン採番&Push]
    K --> L[⑨ GitHub Releasesノート作成]
    
    classDef human fill:#1f2937,stroke:#374151,stroke-width:2px,color:#f3f4f6;
    classDef auto fill:#065f46,stroke:#047857,stroke-width:2px,color:#ffffff;
    classDef fail fill:#be123c,stroke:#9f1239,stroke-width:2px,color:#ffffff;
    
    class A,B,C,D,F,G,I,K,L,L1 human;
    class E,H,J,L2 auto;
```

---

## バージョンと履歴の管理（リリースノート）

本番環境のバージョンと変更履歴は、以下の手軽なフローで管理します。

1. **現状バージョンの確認**
   まずは、これから上げるバージョンを決めるため、現状のバージョンを確認します。
   * **方法A:** `package.json` の `"version"` の行を見る。
   * **方法B:** アプリ画面の最下部（フッター）に表示されている `v1.0.1` などの数値を直接見る。

2. **バージョンの採番 (npm version)**
   リリースを行う際、ターミナルで以下のコマンドを実行します。
   ```bash
   # 小さな修正・バグフィックスの場合（例: 1.0.1 -> 1.0.2）
   npm version patch
   
   # 新機能の追加などの中規模アップデートの場合（例: 1.0.2 -> 1.1.0）
   npm version minor
   ```
   このコマンドにより、自動的に `package.json` のバージョンが上がり、Gitタグが作成され、コミットされます。

3. **アプリ画面への表示確認**
   `vite.config.ts` で `package.json` のバージョン番号を読み取り、画面の一番下（フッターのクレジットの下）に自動で表示されます。`npm version` 実行後は、ローカルや本番環境でこの表示が変わっていることを確認します。

4. **リリースノートの作成 (GitHub Releases)**
   `git push --tags` でタグをGitHubにPushしたあと、GitHubの **Releases** 画面から `Draft a new release` を選び、該当のタグに対して「どんな機能を追加したか」をメモしておくことで、美しい履歴が残ります。
