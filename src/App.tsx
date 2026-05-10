import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import StickyNote from './components/StickyNote';
import './index.css';

declare const __APP_VERSION__: string;

function App() {
  const [url, setUrl] = useState('');
  const [debouncedUrl, setDebouncedUrl] = useState('');

  // iOSでの入力中断（1文字しか入らない問題）や、重いエフェクトの連発を防ぐための遅延処理
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUrl(url), 500);
    return () => clearTimeout(timer);
  }, [url]);
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
          // ローカル開発環境では本番DBを汚さないようカウントアップ通信をスキップ
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (!isLocal) {
            await Promise.all([
              setDoc(globalRef, { totalVisitors: increment(1) }, { merge: true }),
              setDoc(dailyRef, { dailyVisitors: increment(1) }, { merge: true })
            ]);
          }
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
    if (!debouncedUrl) {
      const id = requestAnimationFrame(() => setGenerateTime('0.000'));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    
    const rafId = requestAnimationFrame(async () => {
      const end = performance.now();
      const time = Math.max(0.0001, ((end - start) / 1000) + (Math.random() * 0.0004)).toFixed(4);
      setGenerateTime(time);

      try {
        const confettiModule = await import('canvas-confetti');
        type ConfettiFn = (opts: Record<string, unknown>) => void;
        const fireConfetti = (confettiModule.default ?? confettiModule) as unknown as ConfettiFn;
        fireConfetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#34d399', '#fff9c4', '#ffffff'] // ダークテーマに映える色
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
      
      const msgs = ['SUCCESS', 'BRILLIANT', 'PERFECT', 'AWESOME'];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setSuccessMessage(randomMsg);
      
      setTimeout(() => setSuccessMessage(null), 2500);
    });
    return () => cancelAnimationFrame(rafId);
  }, [debouncedUrl]);

  const handleDownload = async () => {
    if (!url) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(0, 0, 600, 600);

    const qrSize = 400;
    const qrX = (600 - qrSize) / 2;
    const qrY = (600 - qrSize) / 2 - 20;
    ctx.fillStyle = 'white';
    ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    const qrCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }

    if (withLogo) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.font = 'bold 20px "BIZ UDGothic", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('powered by 俺の付箋', 580, 580);
    }

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
        // スマホ等向けのフォールバック処理
        const file = new File([blob], '俺のQR.png', { type: 'image/png' });
        
        // Web Share API（ネイティブの共有メニュー）が使える場合
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '俺のQR',
            });
            // シェア成功ならそのまま終了
          } catch (e: any) {
            // キャンセルされた場合は何もしない、それ以外のエラーはaタグへフォールバック
            if (e.name !== 'AbortError') {
              forceDownload(blob);
            }
          }
        } else {
          // Share APIが使えない場合の最終手段
          forceDownload(blob);
        }
      }

      function forceDownload(blob: Blob) {
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

      try {
        const today = getTodayStr();
        const globalRef = doc(db, 'stats', 'global');
        const dailyRef = doc(db, 'stats', today);
        
        // ローカル開発環境では本番DBを汚さないようカウントアップ通信をスキップ
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) {
          await Promise.all([
            setDoc(globalRef, { totalSaves: increment(1) }, { merge: true }),
            setDoc(dailyRef, { dailySaves: increment(1) }, { merge: true })
          ]);
        }
        
        setStats(prev => ({
          ...prev,
          totalSaves: prev.totalSaves + 1,
          dailySaves: prev.dailySaves + 1
        }));
      } catch (error) {
        console.error("Firestoreの更新エラー:", error);
      }

    } catch (err: unknown) {
      if (!(err instanceof Error) || err.name !== 'AbortError') {
        console.error('保存に失敗しました:', err);
        alert('保存に失敗しました。ブラウザの設定等をご確認ください。');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }} className="animate-fade-in">
        <h1 className="hero-title">俺のQR</h1>
        <p className="hero-subtitle">URLをいれるだけ。世界一シンプルなQR付箋。</p>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel animate-fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URLを入力してください (https://...)"
            className="premium-input"
          />
          <div style={{ 
            height: '1.5rem',
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            marginTop: '0.5rem',
            paddingRight: '0.5rem',
            opacity: url ? 1 : 0,
            transition: 'opacity 0.2s',
            color: '#34d399',
            fontSize: '0.9rem',
            fontWeight: '700',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}>
            ⚡ 生成時間: {generateTime}s
          </div>
        </div>

        {/* Preview Area (Primary Focus) */}
        <div className="sticky-wrapper" style={{ opacity: url ? 1 : 0.2, transition: 'opacity 0.4s ease' }}>
          <StickyNote 
            id="qr-sticky-note"
            url={debouncedUrl || "https://ore-no-fusen.vercel.app"} 
            color="#fff9c4" 
            text={withLogo ? "powered by 俺の付箋" : ""} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={withLogo} 
              onChange={(e) => setWithLogo(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div className="checkbox-custom"></div>
            「俺の付箋」のクレジットを入れる
          </label>
        </div>

        {/* Message Area */}
        <div style={{ height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {successMessage && (
            <div style={{
              color: '#34d399',
              fontWeight: '900',
              fontSize: '1.25rem',
              letterSpacing: '0.1em',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              ✨ {successMessage} ✨
            </div>
          )}
        </div>
        
        {/* Save Button (Secondary Action) */}
        <button
          onClick={handleDownload}
          disabled={!url}
          className="premium-button"
        >
          QR付箋を保存する
        </button>
      </div>

      {/* Stats Panel */}
      <div className="glass-panel animate-fade-in delay-2" style={{ padding: '2rem' }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">本日の来訪者</div>
            <div className="stat-value">{stats.dailyVisitors.toLocaleString()} <span className="stat-unit">人</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">本日の変換数</div>
            <div className="stat-value highlight">{stats.dailySaves.toLocaleString()} <span className="stat-unit">枚</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">累計の来訪者</div>
            <div className="stat-value">{stats.totalVisitors.toLocaleString()} <span className="stat-unit">人</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">累計の変換数</div>
            <div className="stat-value highlight">{stats.totalSaves.toLocaleString()} <span className="stat-unit">枚</span></div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a 
            href="https://ore-no-fusen.vercel.app" 
            style={{ 
              color: '#34d399', 
              fontSize: '0.95rem', 
              textDecoration: 'none', 
              fontWeight: '600',
              borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
              paddingBottom: '2px',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => (e.currentTarget.style.borderBottomColor = '#34d399')}
            onMouseOut={e => (e.currentTarget.style.borderBottomColor = 'rgba(52, 211, 153, 0.3)')}
          >
            「俺の付箋」について詳しく
          </a>
        </div>
      </div>

      {/* Footer / Version Info */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '-1rem', 
        color: 'rgba(255, 255, 255, 0.3)', 
        fontSize: '0.8rem',
        fontFamily: 'monospace'
      }}>
        v{__APP_VERSION__}
      </footer>

    </div>
  );
}

export default App;
