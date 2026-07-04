import { useState } from 'react';

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {}
    }
  };

  return (
    <div className="flex gap-1" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
        style={{ background: '#25D366', color: 'white', fontSize: '0.8rem' }}
      >
        💬 WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
        style={{ background: '#1DA1F2', color: 'white', fontSize: '0.8rem' }}
      >
        🐦 Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm"
        style={{ background: '#0A66C2', color: 'white', fontSize: '0.8rem' }}
      >
        💼 LinkedIn
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=Check%20out%20this%20tool:%20${encodedUrl}`}
        className="btn btn-sm btn-secondary"
        style={{ fontSize: '0.8rem' }}
      >
        ✉️ Email
      </a>
      <button
        className={`btn btn-sm ${copied ? '' : 'btn-secondary'}`}
        style={copied ? { background: 'var(--accent-green)', color: 'white', fontSize: '0.8rem' } : { fontSize: '0.8rem' }}
        onClick={handleCopyLink}
      >
        {copied ? '✓ Copied!' : '🔗 Copy Link'}
      </button>
      {navigator.share && (
        <button className="btn btn-sm btn-secondary" onClick={handleNativeShare} style={{ fontSize: '0.8rem' }}>
          📤 Share
        </button>
      )}
    </div>
  );
}
