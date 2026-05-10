import { test, chromium, devices } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(devices['iPhone 13']);
  const page = await context.newPage();

  console.log('📱 iPhone 13シミュレータでローカル環境にアクセス中 (Port 5174)...');
  await page.goto('http://localhost:5174/');

  const input = page.locator('input[type="text"]');
  await input.waitFor();

  console.log('⌨️ 文字を高速で入力します...');
  // 意図的に1文字ずつキーボード入力をシミュレート
  await input.fill('');
  await page.waitForTimeout(500);

  const beforeTimeText = await page.locator('text=生成時間').textContent();
  console.log(`⏱️ 入力前の表示: ${beforeTimeText?.trim()}`);

  // 高速で「あいうえお」と入力（英語のa,i,u,e,o相当のキーボード入力）
  await input.pressSequentially('aiueo', { delay: 50 });

  // 入力直後（500ms未満）にQRが再生成されていないことを確認
  const immediatelyAfterText = await page.locator('text=生成時間').textContent();
  console.log(`⏱️ 入力直後（処理が止まっているか）: ${immediatelyAfterText?.trim()}`);

  if (beforeTimeText === immediatelyAfterText) {
    console.log('✅ 成功: 入力中はQR生成（重い処理）がストップしています！');
  } else {
    console.log('❌ 失敗: 入力中にQR生成が走ってしまっています。');
  }

  console.log('⏳ 0.5秒待機します（ユーザーが文字を打ち終わった想定）...');
  await page.waitForTimeout(1000);

  const afterWaitText = await page.locator('text=生成時間').textContent();
  console.log(`⏱️ 待機後の表示: ${afterWaitText?.trim()}`);

  if (beforeTimeText !== afterWaitText) {
    console.log('✅ 成功: 入力が止まった後にQRが生成されました！');
  } else {
    console.log('❌ 失敗: QRが生成されていません。');
  }

  await browser.close();
})();
