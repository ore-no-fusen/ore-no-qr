import { chromium } from '@playwright/test';

const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body {
    margin: 0;
    padding: 0;
    width: 1200px;
    height: 630px;
    background-color: #1a1a1c;
    color: #ffffff;
    font-family: "BIZ UDGothic", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .bg-glow {
    position: absolute;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(100,150,255,0.05) 0%, rgba(0,0,0,0) 70%);
    top: -200px;
    left: -200px;
    border-radius: 50%;
  }
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 1040px;
    z-index: 1;
  }
  .left-col {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }
  .title {
    font-size: 52px;
    font-weight: 800;
    margin: 0;
    line-height: 1.3;
    letter-spacing: 2px;
  }
  .subtitle {
    font-size: 44px;
    font-weight: 900;
    margin: 0;
    color: #10B981;
    letter-spacing: 2px;
  }
  .features {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 15px;
  }
  .feature {
    font-size: 32px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 15px;
    color: #ddd;
  }
  .check {
    color: #10B981;
    background: rgba(16, 185, 129, 0.15);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .right-col {
    background: rgba(255, 255, 255, 0.05);
    padding: 30px;
    border-radius: 40px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  }
  .qr-inner {
    background: #fff;
    padding: 20px;
    border-radius: 20px;
  }
  .brand {
    position: absolute;
    bottom: 30px;
    left: 80px;
    font-size: 20px;
    font-weight: 500;
    color: #555;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="container">
    <div class="left-col">
      <div class="subtitle">商用利用もOK！</div>
      <div class="title">ずーっと無料で使える<br>QRメーカー</div>
      <div class="features">
        <div class="feature"><div class="check">✓</div> PC・スマホ対応</div>
        <div class="feature"><div class="check">✓</div> 登録不要・広告ゼロ</div>
        <div class="feature"><div class="check">✓</div> URLを入れるだけ</div>
      </div>
    </div>
    <div class="right-col">
      <div class="qr-inner">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 33 33'%3E%3Cpath fill='%23000' d='M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM10 0h1v7h-1zM12 0h1v1h-1zM14 0h3v1h-3zM18 0h3v1h-3zM22 0h1v1h-1zM24 0h2v1h-2zM26 0h7v7h-7zM27 1v5h5V1zM28 2h3v3h-3zM0 9h1v1H0zM2 9h1v1H2zM4 9h2v1H4zM7 9h1v1H7zM9 9h2v1H9zM12 9h1v1h-1zM14 9h1v1h-1zM16 9h3v1h-3zM20 9h1v1h-1zM22 9h4v1h-4zM27 9h1v1h-1zM29 9h4v1h-4zM0 11h2v1H0zM3 11h1v1H3zM5 11h1v1H5zM8 11h2v1H8zM12 11h3v1h-3zM16 11h1v1h-1zM18 11h1v1h-1zM20 11h1v1h-1zM22 11h1v1h-1zM24 11h1v1h-1zM26 11h3v1h-3zM30 11h3v1h-3zM0 13h1v1H0zM2 13h3v1H2zM6 13h1v1H6zM8 13h1v1H8zM10 13h1v1h-1zM13 13h3v1h-3zM17 13h2v1h-2zM20 13h2v1h-2zM23 13h1v1h-1zM25 13h1v1h-1zM27 13h2v1h-2zM30 13h1v1h-1zM0 15h3v1H0zM4 15h1v1H4zM6 15h3v1H6zM11 15h1v1h-1zM13 15h1v1h-1zM15 15h2v1h-2zM18 15h1v1h-1zM21 15h2v1h-2zM24 15h1v1h-1zM26 15h1v1h-1zM28 15h3v1h-3zM32 15h1v1h-1zM0 17h1v1H0zM3 17h3v1H3zM7 17h1v1H7zM9 17h1v1H9zM11 17h1v1h-1zM13 17h3v1h-3zM18 17h1v1h-1zM20 17h1v1h-1zM22 17h2v1h-2zM26 17h1v1h-1zM28 17h2v1h-2zM32 17h1v1h-1zM0 19h2v1H0zM3 19h2v1H3zM6 19h1v1H6zM9 19h2v1H9zM12 19h1v1h-1zM14 19h3v1h-3zM18 19h2v1h-2zM21 19h2v1h-2zM24 19h1v1h-1zM26 19h1v1h-1zM28 19h1v1h-1zM30 19h1v1h-1zM0 21h1v1H0zM2 21h1v1H2zM4 21h2v1H4zM7 21h1v1H7zM9 21h2v1H9zM12 21h1v1h-1zM15 21h2v1h-2zM19 21h2v1h-2zM22 21h2v1h-2zM25 21h1v1h-1zM27 21h1v1h-1zM30 21h2v1h-2zM0 23h2v1H0zM3 23h2v1H3zM6 23h2v1H6zM11 23h2v1h-2zM14 23h1v1h-1zM16 23h1v1h-1zM18 23h1v1h-1zM21 23h2v1h-2zM24 23h1v1h-1zM26 23h7v7h-7zM27 24v5h5v-5zM28 25h3v3h-3zM0 26h7v7H0zM1 27v5h5v-5zM2 28h3v3H2zM8 26h1v1H8zM10 26h2v1h-2zM13 26h2v1h-2zM16 26h2v1h-2zM19 26h1v1h-1zM21 26h1v1h-1zM23 26h2v1h-2zM9 28h1v1H9zM11 28h1v1h-1zM13 28h1v1h-1zM16 28h2v1h-2zM19 28h2v1h-2zM22 28h3v1h-3zM8 30h2v1H8zM11 30h1v1h-1zM13 30h1v1h-1zM15 30h1v1h-1zM17 30h1v1h-1zM19 30h1v1h-1zM22 30h1v1h-1zM24 30h1v1h-1zM8 32h1v1H8zM10 32h1v1h-1zM12 32h1v1h-1zM14 32h1v1h-1zM16 32h2v1h-2zM20 32h2v1h-2zM24 32h1v1h-1z'/%3E%3C/svg%3E" width="280" height="280" alt="QR Code">
      </div>
    </div>
  </div>
  <div class="brand">俺のQR | ore-no-qr.vercel.app</div>
</body>
</html>
`;

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(html);
    await page.waitForTimeout(1000); 
    await page.screenshot({ path: 'public/ogp.png' });
    await browser.close();
    console.log('✅ 新しいOGP画像を public/ogp.png に生成しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
})();
