# 俺のQR

<div align="center">

**URLを貼るだけで、0.003秒でQRコード付箋ができる**

完全無料 / ログイン不要 / 履歴保存なし

[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Firebase](https://img.shields.io/badge/DB-Firebase-orange?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[🔗 アプリを開く](https://qr-designer.vercel.app) • [俺の付箋について](https://ore-no-fusen.vercel.app)

</div>

---

## ✨ 特徴

### ⚡ 爆速QR生成
- URLを入力した瞬間にQRコードがリアルタイム生成
- 生成タイムを「0.003秒」のようにリアル表示
- 紙吹雪（confetti）で「URLが絵になった！」瞬間を祝福

### 📋 付箋スタイルの出力
- QRコードを付箋風デザイン（淡い黄色・影付き）でレイアウト
- 「powered by 俺の付箋」のロゴ入り/なしを選択可能
- PNG画像としてワンクリックでダウンロード保存

### 📊 アクセスカウンター（Firebase連携）
- 本日の来訪者数・変換数をリアルタイム表示
- 累計の来訪者数・変換数を永続保存
- 同一ブラウザ・同一日の重複カウント防止（localStorage）
- サーバーレス（Firebase Firestore）で放置しても常時稼動

### 🔒 プライバシー重視
- 入力されたURLはサーバーへ一切送信しない
- 履歴・ログの記録なし
- 来訪者カウントは匿名の統計数値のみ（個人特定不可）

---

## 🛠️ 技術スタック

| 種別 | 技術 |
|------|------|
| フレームワーク | React 18 + TypeScript + Vite |
| QR生成 | qrcode.react (QRCodeCanvas) |
| 演出 | canvas-confetti |
| データベース | Firebase Firestore（Tokyo / NoSQL） |
| ホスティング | Vercel |
| スタイリング | Vanilla CSS（CSS変数） |

---

## 📁 ディレクトリ構成

```
qr-designer/
├── src/
│   ├── App.tsx              # メインロジック（状態管理・QR生成・保存・統計）
│   ├── firebase.ts          # Firebase初期化・Firestoreエクスポート
│   ├── index.css            # グローバルスタイル・デザイントークン
│   ├── main.tsx             # Reactエントリーポイント
│   └── components/
│       └── StickyNote.tsx   # QR付箋コンポーネント（描画・レイアウト）
├── index.html
├── AG_RULES.md              # AI開発ルール
└── README.md                # このファイル
```

---

## 🗃️ Firestore データ構造

```
stats/ (コレクション)
├── global (ドキュメント)
│   ├── totalVisitors: number   # 累計来訪者数
│   └── totalSaves: number      # 累計保存数
└── 2026-05-10 (ドキュメント ※日付ごとに自動生成)
    ├── dailyVisitors: number   # 当日来訪者数
    └── dailySaves: number      # 当日保存数
```

---

## 🚀 ローカル開発

### 前提条件
- Node.js 18以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/ore-no-fusen/qr-designer.git
cd qr-designer

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### Firebase接続について
`src/firebase.ts` に接続情報が記載されています。
Firebase Firestoreのセキュリティルールを「テストモード」に設定することで読み書きが可能になります。

---

## 📖 ドキュメント

- [開発ルール](AG_RULES.md) - AIと協働するための開発ルール
- [俺の付箋](https://ore-no-fusen.vercel.app) - 姉妹プロジェクト

---

## 📝 ライセンス

MIT License

---

<div align="center">

**「URLが絵になる」その瞬間を楽しもう** 🎉

Made with ❤️ by ONF Studios

</div>
