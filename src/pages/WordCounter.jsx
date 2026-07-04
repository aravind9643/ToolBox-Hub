import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (words > 0 ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200); // 200 WPM average
    const speakingTime = Math.ceil(words / 130); // 130 WPM speaking
    const lines = text ? text.split('\n').length : 0;

    // Letter frequency
    const freq = {};
    const letters = text.toLowerCase().replace(/[^a-z]/g, '');
    for (const ch of letters) freq[ch] = (freq[ch] || 0) + 1;
    const topLetters = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Word frequency
    const wordFreq = {};
    const ws = text.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
    for (const w of ws) wordFreq[w] = (wordFreq[w] || 0) + 1;
    const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime, lines, topLetters, topWords };
  }, [text]);

  return (
    <div className="tool-page">
      <SEOHead title="Word Counter" description="Count words, characters, sentences, and estimate reading time. Free text analysis tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Word Counter</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-paragraph" style={{ color: 'var(--accent-purple-light)' }}></i> Word & Character Counter
        </h1>
        <p>Analyze your text with word count, character count, reading/speaking time, and keyword density.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <textarea
              className="form-textarea"
              rows="10"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Start typing or paste your text here..."
              style={{ fontSize: '0.95rem', minHeight: 200 }}
            />

            <div className="stats-grid mt-2">
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-purple-light)' }}>{stats.words}</div>
                <div className="stat-card-label">Words</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-cyan)' }}>{stats.chars}</div>
                <div className="stat-card-label">Characters</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-green)' }}>{stats.charsNoSpaces}</div>
                <div className="stat-card-label">Without Spaces</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-pink)' }}>{stats.sentences}</div>
                <div className="stat-card-label">Sentences</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-amber)' }}>{stats.paragraphs}</div>
                <div className="stat-card-label">Paragraphs</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--accent-cyan-light)' }}>{stats.lines}</div>
                <div className="stat-card-label">Lines</div>
              </div>
            </div>

            <div className="grid-2 mt-2">
              <div className="result-box" style={{ marginTop: 0 }}>
                <div className="result-label">📖 Reading Time</div>
                <div className="result-value result-value-sm">{stats.readingTime} min</div>
                <div className="result-sub">Based on 200 WPM</div>
              </div>
              <div className="result-box" style={{ marginTop: 0 }}>
                <div className="result-label">🎤 Speaking Time</div>
                <div className="result-value result-value-sm">{stats.speakingTime} min</div>
                <div className="result-sub">Based on 130 WPM</div>
              </div>
            </div>

            {stats.topWords.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Top Words</h3>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  {stats.topWords.map(([word, count]) => (
                    <span key={word} className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                      {word}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setText(text.toUpperCase())}>UPPERCASE</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setText(text.toLowerCase())}>lowercase</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setText(text.replace(/\b\w/g, c => c.toUpperCase()))}>Title Case</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setText('')} style={{ gap: '6px' }}><i className="fa-solid fa-trash-can"></i> Clear</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(text)} style={{ gap: '6px' }}><i className="fa-solid fa-copy"></i> Copy</button>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Word Counter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
