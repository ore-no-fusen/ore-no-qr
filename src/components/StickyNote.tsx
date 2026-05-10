import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface StickyNoteProps {
  url: string;
  color: string;
  text: string;
  id?: string;
}

const StickyNote: React.FC<StickyNoteProps> = ({ url, color, text, id }) => {
  return (
    <div 
      id={id}
      className="sticky-note-container animate-appear"
      style={{
        backgroundColor: color,
        padding: '2.5rem',
        width: '300px',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '2px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Sticky Tape Effect */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-1deg)',
        width: '120px',
        height: '35px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        zIndex: 1
      }} />

      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
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
          right: '12px',
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
