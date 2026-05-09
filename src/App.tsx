import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import StickyNote from './components/StickyNote';
import './index.css';

function App() {
  const [url, setUrl] = useState('');
  const [withLogo, setWithLogo] = useState(true);
  const [generateTime, setGenerateTime] = useState<string>('0.000');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    dailyVisitors: 0,
    dailySaves: 0,
    totalVisitors: 0,
    totalSaves: 0
  });


  // 今日の日付文字列（YYYY-MM-DD）を取得する関数
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 初期ロード時にFirestoreから統計情報を取得＆来訪者カウントアップ
  useEffect(() => {
    const initStats = async () => {
      try {
        const today = getTodayStr();
        const globalRef = doc(db, 'stats', 'global');
        const dailyRef = doc(db, 'stats', today);

        // このブラウザで今日すでにカウント済みかチェック
        const visitedKey = `visited_${today}`;
        const hasVisitedToday = localStorage.getItem(visitedKey);

        if (!hasVisitedToday) {
          // 初回訪問なら来訪者を+1
          await Promise.all([
            setDoc(globalRef, { totalVisitors: increment(1) }, { merge: true }),
            setDoc(dailyRef, { dailyVisitors: increment(1) }, { merge: true })
          ]);
          localStorage.setItem(visitedKey, 'true');
        }

        // 最新のデータを取得して画面に表示
        const [globalSnap, dailySnap] = await Promise.all([
          getDoc(globalRef),
          getDoc(dailyRef)
        ]);

        setStats({
          totalVisitors: globalSnap.exists() ? globalSnap.data().totalVisitors || 0 : 0,
          totalSaves: globalSnap.exists() ? globalSnap.data().totalSaves || 0 : 0,
          dailyVisitors: dailySnap.exists() ? dailySnap.data().dailyVisitors || 0 : 0,
          dailySaves: dailySnap.exists() ? dailySnap.data().dailySaves || 0 : 0,
        });

      } catch (error) {
        console.error("Firestoreの読み込みエラー:", error);
      }
    };
    initStats();
  }, []);

  // スピード計測
  useEffect(() => {
    if (!url) {
      // requestAnimationFrameを使ってEffect外でstateを更新
      const id = requestAnimationFrame(() => setGenerateTime('0.000'));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    
    // Reactの描画サイクル直後に時間を計測
    const rafId = requestAnimationFrame(async () => {
      const end = performance.now();
      // 0.000秒にならないよう、実際の処理速度に微細な乱数を足して「リアルな超高速タイム」を演出
      const time = Math.max(0.001, ((end - start) / 1000) + (Math.random() * 0.004)).toFixed(3);
      setGenerateTime(time);

      // URL入力（生成）と同時に紙吹雪を舞わせる
      try {
        const confettiModule = await import('canvas-confetti');
        const fireConfetti = confettiModule.default || confettiModule;
        fireConfetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
      
      const msgs = ['成功！', 'おめでとう！', 'やったね！', 'できたね！'];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setSuccessMessage(randomMsg);
      
      // 2秒後にメッセージを消す
      setTimeout(() => setSuccessMessage(null), 2000);
    });
    return () => cancelAnimationFrame(rafId);
  }, [url, withLogo]);

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
        const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
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

      // Firestoreのカウンター(保存数)を+1する
      try {
        const today = getTodayStr();
        const globalRef = doc(db, 'stats', 'global');
        const dailyRef = doc(db, 'stats', today);
        
        await Promise.all([
          setDoc(globalRef, { totalSaves: increment(1) }, { merge: true }),
          setDoc(dailyRef, { dailySaves: increment(1) }, { merge: true })
        ]);
        
        setStats(prev => ({
          ...prev,
          totalSaves: prev.totalSaves + 1,
          dailySaves: prev.dailySaves + 1
        }));
      } catch (error) {
        console.error("Firestoreの更新エラー:", error);
      }

    } catch (err: unknown) {
      // ユーザーがキャンセルした場合（AbortError）は無視する
      if (!(err instanceof Error) || err.name !== 'AbortError') {
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
        <div style={{ position: 'relative' }}>
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
          {url && (
            <div style={{ 
              position: 'absolute', 
              right: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              生成時間: {generateTime}秒
            </div>
          )}
        </div>

        {/* 生成成功メッセージをプレビューの上に移動 */}
        {successMessage && (
          <div style={{
            color: '#f59e0b',
            fontWeight: '900',
            textAlign: 'center',
            fontSize: '1.5rem',
            animation: 'fadeIn 0.2s ease-in-out',
            height: '2rem'
          }}>
            🎉 {successMessage} 🎉
          </div>
        )}
        
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

        {/* Firebase アクセスカウンター (4項目) */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: '#f8fafc',
          borderRadius: '20px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>本日の来訪者</div>
            <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#0f172a' }}>
              {stats.dailyVisitors.toLocaleString()} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>人</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}>本日の変換数</div>
            <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#10b981' }}>
              {stats.dailySaves.toLocaleString()} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>枚</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>累計の来訪者</div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#475569' }}>
              {stats.totalVisitors.toLocaleString()} <span style={{fontSize:'0.7rem', fontWeight:'normal'}}>人</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>累計の変換数</div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#10b981' }}>
              {stats.totalSaves.toLocaleString()} <span style={{fontSize:'0.7rem', fontWeight:'normal'}}>枚</span>
            </div>
          </div>
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
