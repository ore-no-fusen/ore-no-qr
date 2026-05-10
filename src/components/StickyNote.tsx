import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface StickyNoteProps {
  url: string;
  color: string;
  text: string;
  id?: string;
}

const StickyNote: React.FC<StickyNoteProps> = ({ url, text, id }) => {
  return (
    <div 
      id={id}
      className="sticky-note-container animate-appear"
      style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        width: '300px',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderRadius: '8px',
      }}>
        <QRCodeCanvas 
          value={url || "https://example.com"} 
          size={180}
          level="H"
          includeMargin={false}
        />
      </div>

      {text && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          fontSize: '0.7rem',
          color: 'rgba(0, 0, 0, 0.4)',
          fontWeight: '700',
          letterSpacing: '0.05em'
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default StickyNote;
