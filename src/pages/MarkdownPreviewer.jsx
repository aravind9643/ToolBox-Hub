import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

function parseMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Code Blocks
  html = html.replace(/```([\s\S]*?)```/gm, '<pre class="code-block">$1</pre>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold / Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(`# Markdown Previewer\n\nWrite some markdown here to preview it instantly.\n\n## Sub Heading\n- **Bold text**\n- *Italic text*\n- \`Inline code\`\n- > Quote section\n\n\`\`\`javascript\nconst hello = "world";\nconsole.log(hello);\n\`\`\``);

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div className="tool-page">
      <SEOHead title="Markdown Previewer" description="Write and preview Markdown formatting instantly. Free browser-based editor." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Markdown Previewer</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-file-code" style={{ color: 'var(--accent-purple-light)' }}></i> Markdown Previewer
        </h1>
        <p>Live Markdown editor and preview tool.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="grid-2">
            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Editor</h2>
              <textarea
                className="form-textarea"
                rows="15"
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Type Markdown here..."
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', minHeight: '350px' }}
              />
            </div>
            
            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Preview</h2>
              <div 
                className="result-box" 
                style={{ minHeight: '350px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', overflowY: 'auto', padding: '1rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Live Markdown Previewer — ToolBox Hub" />
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
