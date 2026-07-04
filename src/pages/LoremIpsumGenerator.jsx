import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'numquam', 'corporis', 'suscipit', 'laboriosam'
];

function generateSentence(minWords = 5, maxWords = 15) {
  const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words = Array.from({ length: len }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph(sentences = 5) {
  return Array.from({ length: sentences }, () => generateSentence()).join(' ');
}

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    let text = '';
    if (type === 'paragraphs') {
      const paragraphs = Array.from({ length: count }, () => generateParagraph(Math.floor(Math.random() * 3) + 4));
      if (startWithLorem) {
        paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraphs[0];
      }
      text = paragraphs.join('\n\n');
    } else if (type === 'sentences') {
      const sentences = Array.from({ length: count }, () => generateSentence());
      if (startWithLorem) {
        sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      }
      text = sentences.join(' ');
    } else {
      const words = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      if (startWithLorem && count >= 2) {
        words[0] = 'lorem';
        words[1] = 'ipsum';
      }
      text = words.join(' ');
    }
    return text;
  }, [count, type, startWithLorem]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output.trim().split(/\s+/).length;
  const charCount = output.length;

  return (
    <div className="tool-page">
      <SEOHead title="Lorem Ipsum Generator" description="Generate Lorem Ipsum placeholder text. Customize paragraphs, sentences, or words. Free and instant." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Lorem Ipsum</span></div>
        <h1>📄 Lorem Ipsum Generator</h1>
        <p>Generate placeholder text for your designs and mockups.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="tabs">
              <button className={`tab-btn ${type === 'paragraphs' ? 'active' : ''}`} onClick={() => setType('paragraphs')}>Paragraphs</button>
              <button className={`tab-btn ${type === 'sentences' ? 'active' : ''}`} onClick={() => setType('sentences')}>Sentences</button>
              <button className={`tab-btn ${type === 'words' ? 'active' : ''}`} onClick={() => setType('words')}>Words</button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Count: {count}</label>
                <input className="form-range" type="range" min="1" max={type === 'words' ? 200 : type === 'sentences' ? 50 : 20} value={count} onChange={e => setCount(Number(e.target.value))} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className="form-toggle">
                  <input type="checkbox" checked={startWithLorem} onChange={() => setStartWithLorem(!startWithLorem)} />
                  <span className="form-toggle-slider" />
                  Start with "Lorem ipsum..."
                </label>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '0.5rem', maxHeight: 400, overflowY: 'auto', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {output}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1">
                <span className="badge badge-purple">{wordCount} words</span>
                <span className="badge badge-cyan">{charCount} characters</span>
              </div>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ padding: '0.5rem 1rem' }}>{copied ? '✓ Copied!' : '📋 Copy to Clipboard'}</button>
            </div>
          </div>
        </div>
        <div className="tool-sidebar">
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
