import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

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
  const [type, setType] = useState('paragraphs'); // 'paragraphs' | 'sentences' | 'words' | 'lists' | 'forms'
  const [format, setFormat] = useState('text'); // 'text' | 'html' | 'markdown'
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    let rawItems = [];
    
    if (type === 'paragraphs') {
      rawItems = Array.from({ length: count }, () => generateParagraph(Math.floor(Math.random() * 3) + 4));
      if (startWithLorem && rawItems.length > 0) {
        rawItems[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + rawItems[0];
      }
      
      if (format === 'html') {
        return rawItems.map(p => `<p>${p}</p>`).join('\n');
      }
      if (format === 'markdown') {
        return rawItems.join('\n\n');
      }
      return rawItems.join('\n\n');
    }
    
    if (type === 'sentences') {
      rawItems = Array.from({ length: count }, () => generateSentence());
      if (startWithLorem && rawItems.length > 0) {
        rawItems[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + rawItems[0];
      }
      
      if (format === 'html') {
        return `<p>${rawItems.join(' ')}</p>`;
      }
      return rawItems.join(' ');
    }
    
    if (type === 'words') {
      const words = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      if (startWithLorem && count >= 2) {
        words[0] = 'lorem';
        words[1] = 'ipsum';
      }
      const text = words.join(' ');
      if (format === 'html') {
        return `<span>${text}</span>`;
      }
      return text;
    }

    if (type === 'lists') {
      const listItems = Array.from({ length: count }, () => generateSentence(4, 8));
      if (format === 'html') {
        return `<ul>\n${listItems.map(li => `  <li>${li}</li>`).join('\n')}\n</ul>`;
      }
      if (format === 'markdown') {
        return listItems.map(li => `* ${li}`).join('\n');
      }
      return listItems.map(li => `- ${li}`).join('\n');
    }

    if (type === 'forms') {
      if (format === 'html') {
        return `<form>\n  <div class="form-group">\n    <label>Email Address</label>\n    <input type="email" placeholder="Enter email" />\n  </div>\n  <div class="form-group">\n    <label>Message</label>\n    <textarea placeholder="Type message..."></textarea>\n  </div>\n  <button type="submit">Submit</button>\n</form>`;
      }
      if (format === 'markdown') {
        return `* Email Address: [___]\n* Message: [__________]\n* [ Submit ]`;
      }
      return `Email Address: [Input email]\nMessage: [Input textarea]\n[Submit Button]`;
    }

    return '';
  }, [count, type, format, startWithLorem]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Lorem Ipsum Placeholder Generator" description="Generate standard placeholder lorem ipsum paragraphs, lists, HTML form mockups, or markdown blocks." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Lorem Ipsum</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-file-lines" style={{ color: 'var(--accent-purple-light)' }}></i> Lorem Ipsum Builder
        </h1>
        <p>Compile custom placeholder words, paragraphs, list bullet items, or markup templates instantly.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Options configuration */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '130px' }}>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                  <option value="lists">Lists (ul/ol)</option>
                  <option value="forms">Form Fields Mock</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                <select className="form-select" value={format} onChange={e => setFormat(e.target.value)} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value="text">Plain Text</option>
                  <option value="html">HTML Code</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, width: '130px' }}>
                <input className="form-range" type="range" min="1" max={type === 'words' ? 100 : 12} value={count} onChange={e => setCount(Number(e.target.value))} style={{ width: '100%', height: '4px', accentColor: 'var(--accent-purple-light)' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                <input type="checkbox" checked={startWithLorem} onChange={e => setStartWithLorem(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--accent-purple-light)' }} />
                Start with "Lorem ipsum"
              </label>
            </div>

            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              maxHeight: '400px',
              overflowY: 'auto',
              fontSize: '0.82rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              fontFamily: format === 'html' || format === 'markdown' ? 'monospace' : 'inherit'
            }}>
              {output}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-purple">{output.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span className="badge badge-cyan">{output.length} characters</span>
              </div>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '6px' }}>
                <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
