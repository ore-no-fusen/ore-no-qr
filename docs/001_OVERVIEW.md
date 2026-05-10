# 001 概要・システム全体像

## What This Is

URLから「俺の付箋」風のQRコード画像を生成するWebアプリケーション。
設定項目を削ぎ落とし、「URLを入力する」「保存する」の2ステップで完結する究極のシンプルさを追求。

## Core Value

> 「設定なんていらない。URLを入れたら、一番いい感じの付箋QRが出てくるだけ」

- **完全無料**
- **ログイン不要**
- **履歴保存なし**

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Vanilla CSS (Tailwind 等のフレームワークは不使用)
- **QR Generation**: `qrcode.react` (Canvas 描画)
- **Deployment**: Vercel (`ore-no-qr.vercel.app`)
- **Database/Analytics**: Firebase Firestore (アクセス・保存数の集計のみ)

## Architecture

本アプリは、ユーザーのプライバシーを最優先とするため、**コア機能（QR画像の生成と保存）をすべてクライアントサイド（ブラウザ上）で完結**させるアーキテクチャを採用している。

1. **ユーザー入力**: React State でURLを管理
2. **QR描画**: `qrcode.react` が非表示の Canvas にQRコードを描画
3. **合成**: 標準の Canvas API (`getContext('2d')`) を用いて、付箋の背景・QRコード・クレジットテキストを1枚の画像に合成
4. **保存**: File System Access API (`showSaveFilePicker`) を使用し、OSネイティブの保存ダイアログ経由でバイナリ(Blob)を直接保存
5. **集計**: 保存完了時のみ、非同期で Firestore のカウンターをインクリメント

データ通信が発生するのは、Firestoreへのアクセス・保存数の集計（インクリメント）のみであり、入力されたURLや生成された画像データがサーバーへ送信されることは一切ない。
