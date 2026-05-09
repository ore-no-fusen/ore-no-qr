import { useState } from 'react';
import StickyNote from './components/StickyNote';
import './index.css';

function App() {
  const [url, setUrl] = useState('');
  const [withLogo, setWithLogo] = useState(true);

  const handleDownload = async () => {
    if (!url) return;

    // 1. Create a hidden canvas for high-quality export
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 2. Draw Sticky Note Background (Yellow)
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(0, 0, 600, 600);

    // 3. Draw a white square for the QR code
    const qrSize = 400;
    const qrX = (600 - qrSize) / 2;
    const qrY = (600 - qrSize) / 2 - 20;
    ctx.fillStyle = 'white';
    ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    // 4. Get the QR code from the existing canvas
    const qrCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }

    // 5. Draw branding text
    if (withLogo) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.font = 'bold 20px "BIZ UDGothic", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('powered by 俺の付箋', 580, 580);
    }

    // 6. Force Download with File System Access API
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!blob) return;

    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: '俺のQR.png',
          types: [{
            description: 'PNG 画像',
            accept: { 'image/png': ['.png'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback for browsers that don't support the API
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = '俺のQR.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
        }, 100);
      }
    } catch (err: any) {
      // ユーザーがキャンセルした場合（AbortError）は無視する
      if (err.name !== 'AbortError') {
        console.error('保存に失敗しました:', err);
        alert('保存に失敗しました。ブラウザの設定等をご確認ください。');
      }
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '3rem',
      paddingTop: '4rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#111827', marginBottom: '0.5rem' }}>
          俺のQR
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          URLをいれるだけ。世界一シンプルなQR付箋。
        </p>
      </div>

      {/* Main Input Area */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URLを入力してください (https://...)"
          style={{
            width: '100%',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '2px solid #e5e7eb',
            fontSize: '1.1rem',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        
        <button
          onClick={handleDownload}
          disabled={!url}
          style={{
            width: '100%',
            padding: '1.25rem',
            backgroundColor: url ? '#111827' : '#9ca3af',
            color: 'white',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: url ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
        >
          QR付箋を保存する
        </button>
      </div>

      {/* Preview Section */}
      <div style={{ 
        padding: '2rem', 
        background: 'white', 
        borderRadius: '24px', 
        boxShadow: 'var(--shadow-lg)',
        opacity: url ? 1 : 0.3,
      }}>
        <StickyNote 
          id="qr-sticky-note"
          url={url || "https://ore-no-fusen.vercel.app"} 
          color="#fff9c4" 
          text={withLogo ? "powered by 俺の付箋" : ""} 
        />
      </div>

      {/* Minimal Settings & Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#4b5563' }}>
          <input 
            type="checkbox" 
            checked={withLogo} 
            onChange={(e) => setWithLogo(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          「俺の付箋」のクレジットを入れる
        </label>

        <div style={{ 
          fontSize: '0.85rem', 
          color: '#9ca3af', 
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          完全無料 / ログイン不要 / 履歴保存なし<br />
          「俺のQR」は、ユーザーのプライバシーを尊重します。
        </div>

        <a 
          href="https://ore-no-fusen.vercel.app" 
          style={{ color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}
        >
          「俺の付箋」について詳しく
        </a>
      </div>
    </div>
  );
}

export default App;
