import { test, expect } from '@playwright/test';

test.describe('俺のQR 総合テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('GEN: URLを入力するとリアルタイムでQRが生成され、デザインが固定される', async ({ page }) => {
    const input = page.getByPlaceholder('URLを入力してください');
    await input.fill('https://example.com');
    
    // 生成時間の表示を待つ
    await expect(page.getByText(/生成時間: \d\.\d{4}s/)).toBeVisible();

    // 紙吹雪アニメーションが終わるまで待機（スクリーンショットの差分を防ぐため）
    await page.waitForTimeout(3500);

    // プレビューエリアのスクリーンショットを撮り、デザイン（黄色の付箋スタイル、サイズ、余白など）が崩れていないか確認する
    // 初回実行時は正解画像が保存され、次回以降に差分がないかを自動チェックします
    const previewArea = page.locator('.sticky-note-container').locator('..');
    await expect(previewArea).toHaveScreenshot('qr-preview-with-logo.png');
  });

  test('BRAND: クレジットのON/OFFでウォーターマークが切り替わる', async ({ page }) => {
    await page.getByPlaceholder('URLを入力してください').fill('https://example.com');
    await page.waitForTimeout(3500); // 紙吹雪を待機
    const previewArea = page.locator('.sticky-note-container').locator('..');
    
    // チェックを外す
    await page.getByRole('checkbox', { name: '「俺の付箋」のクレジットを入れる' }).uncheck();
    
    // ロゴなしバージョンのデザインが崩れていないか確認
    await expect(previewArea).toHaveScreenshot('qr-preview-no-logo.png');
  });

  test('SAVE: 保存ボタンで File System Access API が呼ばれ、外部通信が発生しない', async ({ page }) => {
    await page.getByPlaceholder('URLを入力してください').fill('https://example.com');

    // OSの保存ダイアログ（showSaveFilePicker）をモック化して、正しく呼ばれたかを監視する
    const saveDialogCalled = await page.evaluateHandle(() => {
      const state = { called: false, suggestedName: '' };
      (window as any).showSaveFilePicker = async (options: any) => {
        state.called = true;
        state.suggestedName = options.suggestedName;
        // モックのファイルハンドルを返す（実際の書き込みはしない）
        return { createWritable: async () => ({ write: async () => {}, close: async () => {} }) };
      };
      return state;
    });

    // 外部サーバーへの画像送信（POST等）が発生しないことを監視
    let externalRequestOccurred = false;
    page.on('request', request => {
      const url = request.url();
      // Firestoreとローカル開発サーバー以外のリクエストがあったらフラグを立てる
      if (!url.includes('firestore.googleapis.com') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        externalRequestOccurred = true;
      }
    });

    // 保存ボタンをクリック
    await page.getByRole('button', { name: 'QR付箋を保存する' }).click();

    // 成功メッセージが出るのを待つ
    await expect(page.getByText(/🎉.*🎉/)).toBeVisible();

    // モック化された保存ダイアログが正しいファイル名で呼ばれたか確認
    const state = await saveDialogCalled.jsonValue();
    expect(state.called).toBe(true);
    expect(state.suggestedName).toBe('俺のQR.png');

    // 外部通信が発生していないこと（プライバシー保護）を確認
    expect(externalRequestOccurred).toBe(false);
  });
});
