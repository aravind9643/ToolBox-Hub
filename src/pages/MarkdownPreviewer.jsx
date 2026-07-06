import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

// Configure marked options for standard GFM and carriage return line breaks
marked.use({
  breaks: true,
  gfm: true
});

const templates = {
  readme: `# Project Name

A brief description of what this project does and who it's for.

## Features
- Clean Code architecture
- 100% Client-side utility calculations
- Fully offline capable via PWA caching

## Getting Started

1. Clone the repository
\`\`\`bash
git clone https://github.com/user/project.git
\`\`\`
2. Install dependencies
\`\`\`bash
npm install
\`\`\`
3. Run the development environment
\`\`\`bash
npm run dev
\`\`\``,

  meeting: `# Meeting Notes — Team Sync

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** Alice, Bob, Charlie

## Discussion
1. Review Q2 milestones and timeline.
2. Outline unit converter fixes and responsiveness updates.
3. Validate BMI gauge ranges and chart glitches.

## Action Items
- [ ] Alice to merge PWA service worker offline cache scripts.
- [ ] Bob to verify AdSense publisher slot visibility on staging.
- [ ] Charlie to compile client production build.`,

  todo: `# Daily Tasks

## High Priority
- [x] Fix unit converter alignment issues on mobile viewports.
- [x] Correct BMI gauge rotation percentage values.
- [ ] Integrate Ads slots unit IDs inside Navbar/Sidebar templates.

## Low Priority
- [ ] Clean up redundant variables inside index.css design tokens.
- [ ] Test layout overlays in Safari and iOS devices.`
};

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(`# Markdown Previewer

Write some markdown here to preview it instantly.

## Sub Heading
- **Bold text**
- *Italic text*
- \`Inline code\`
- > Quote section

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\``);

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [layoutMode, setLayoutMode] = useState('split'); // 'split' | 'write' | 'preview'
  const [syncScroll, setSyncScroll] = useState(true);
  
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  const isScrollingEditor = useRef(false);
  const isScrollingPreview = useRef(false);

  // Sync scroll implementation
  const handleScroll = (source) => {
    if (!syncScroll) return;
    const txt = textareaRef.current;
    const pre = previewRef.current;
    if (!txt || !pre) return;

    if (source === 'editor') {
      if (isScrollingPreview.current) return;
      isScrollingEditor.current = true;
      
      const percentage = txt.scrollTop / (txt.scrollHeight - txt.clientHeight);
      pre.scrollTop = percentage * (pre.scrollHeight - pre.clientHeight);
      
      setTimeout(() => {
        isScrollingEditor.current = false;
      }, 50);
    } else {
      if (isScrollingEditor.current) return;
      isScrollingPreview.current = true;
      
      const percentage = pre.scrollTop / (pre.scrollHeight - pre.clientHeight);
      txt.scrollTop = percentage * (txt.scrollHeight - txt.clientHeight);
      
      setTimeout(() => {
        isScrollingPreview.current = false;
      }, 50);
    }
  };

  const html = useMemo(() => {
    try {
      return marked.parse(markdown || '');
    } catch (e) {
      console.error(e);
      return '';
    }
  }, [markdown]);

  useEffect(() => {
    const codeBlocks = previewRef.current?.querySelectorAll('pre code');
    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        block.removeAttribute('data-highlighted');
        hljs.highlightElement(block);
      });
    }
  }, [html]);

  const stats = useMemo(() => {
    const raw = markdown || '';
    const chars = raw.length;
    const words = raw.trim() === '' ? 0 : raw.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readingTime };
  }, [markdown]);

  // Heading outline parser
  const headingOutline = useMemo(() => {
    const raw = markdown || '';
    const lines = raw.split('\n');
    const outline = [];
    lines.forEach((line, idx) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        outline.push({
          level: match[1].length,
          text: match[2].replace(/[*_`]/g, ''),
          lineIndex: idx
        });
      }
    });
    return outline;
  }, [markdown]);

  const scrollToHeading = (lineIndex) => {
    const txt = textareaRef.current;
    const pre = previewRef.current;
    if (!txt || !pre) return;
    const lines = (markdown || '').split('\n');
    const totalLines = lines.length;
    if (totalLines <= 1) return;
    
    const percentage = lineIndex / totalLines;
    const targetScrollTop = percentage * (txt.scrollHeight - txt.clientHeight);
    const targetPreviewScrollTop = percentage * (pre.scrollHeight - pre.clientHeight);
    
    // Temporarily disable scroll listener triggers to prevent conflict
    isScrollingEditor.current = true;
    isScrollingPreview.current = true;
    
    txt.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
    pre.scrollTo({
      top: targetPreviewScrollTop,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      isScrollingEditor.current = false;
      isScrollingPreview.current = false;
    }, 800);
  };

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);
    const replacement = before + selected + after;
    setMarkdown(currentText.substring(0, start) + replacement + currentText.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = () => {
    const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rendered Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; margin: 0; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
    const blob = new Blob([pageHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #000; }
            pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow: auto; }
            code { font-family: monospace; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #555; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Markdown Previewer & Editor" description="Interactive split-pane Markdown editor with live outlines, template helpers, and HTML/PDF exporting features." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Markdown Previewer</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-file-code" style={{ color: 'var(--accent-purple-light)' }}></i> Professional Markdown Editor
        </h1>
        <p>A feature-rich offline Markdown workspace with synchronized scrolling and document outlines.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          {/* Workspace Options Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {/* Layout Mode Toggles */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass-hover)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button 
                className={layoutMode === 'split' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} 
                onClick={() => setLayoutMode('split')}
                style={{ fontSize: '0.75rem', padding: '4px 10px', height: 'auto' }}
              >
                Split view
              </button>
              <button 
                className={layoutMode === 'write' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} 
                onClick={() => setLayoutMode('write')}
                style={{ fontSize: '0.75rem', padding: '4px 10px', height: 'auto' }}
              >
                Editor only
              </button>
              <button 
                className={layoutMode === 'preview' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} 
                onClick={() => setLayoutMode('preview')}
                style={{ fontSize: '0.75rem', padding: '4px 10px', height: 'auto' }}
              >
                Preview only
              </button>
            </div>

            {/* General Settings */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={syncScroll} 
                  onChange={e => setSyncScroll(e.target.checked)} 
                  style={{ accentColor: 'var(--accent-purple-light)' }}
                />
                <span>Sync Scroll</span>
              </label>

              <select 
                className="form-select text-xs" 
                onChange={e => e.target.value && setMarkdown(templates[e.target.value])}
                style={{ padding: '0.25rem 1.5rem 0.25rem 0.5rem', width: 'auto', minWidth: '120px', height: '30px', fontSize: '0.75rem' }}
                defaultValue=""
              >
                <option value="" disabled>Presets...</option>
                <option value="readme">README.md Template</option>
                <option value="meeting">Meeting notes Template</option>
                <option value="todo">Task list Template</option>
              </select>
            </div>
          </div>

          <div className="markdown-workspace" style={{ display: 'grid', gridTemplateColumns: layoutMode === 'split' ? 'minmax(0, 1.2fr) minmax(0, 2fr) minmax(0, 2fr)' : layoutMode === 'write' ? 'minmax(0, 1.2fr) minmax(0, 4fr)' : '4fr', gap: '1.25rem', height: '70vh', minHeight: '550px' }}>
            
            {/* Outline Column (Hidden in Preview Only Mode) */}
            {layoutMode !== 'preview' && (
              <div className="glass-card workspace-column" style={{ padding: '1rem', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-folder-tree"></i> OUTLINE
                </h3>
                {headingOutline.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {headingOutline.map((head, i) => (
                      <div 
                        key={i} 
                        onClick={() => scrollToHeading(head.lineIndex)}
                        style={{ 
                          fontSize: '0.75rem', 
                          paddingLeft: `${(head.level - 1) * 8}px`,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-purple-light)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        {head.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No headings found.</span>
                )}
              </div>
            )}

            {/* Editor Box */}
            {layoutMode !== 'preview' && (
              <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Formatting Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '6px',
                  background: 'var(--bg-glass-hover)',
                  borderBottom: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  flexWrap: 'wrap'
                }}>
                  <button className="copy-btn btn-sm" onClick={() => insertText('**', '**')} title="Bold" style={{ padding: '4px 8px' }}><i className="fa-solid fa-bold"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('*', '*')} title="Italic" style={{ padding: '4px 8px' }}><i className="fa-solid fa-italic"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('# ')} title="H1" style={{ padding: '4px 8px', fontWeight: 700 }}>H1</button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('## ')} title="H2" style={{ padding: '4px 8px', fontWeight: 700 }}>H2</button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('### ')} title="H3" style={{ padding: '4px 8px', fontWeight: 700 }}>H3</button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('> ')} title="Quote" style={{ padding: '4px 8px' }}><i className="fa-solid fa-quote-left"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('`', '`')} title="Inline Code" style={{ padding: '4px 8px' }}><i className="fa-solid fa-code"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('```javascript\n', '\n```')} title="Code Block" style={{ padding: '4px 8px' }}><i className="fa-solid fa-terminal"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('- ')} title="Bullet List" style={{ padding: '4px 8px' }}><i className="fa-solid fa-list"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('1. ')} title="Numbered List" style={{ padding: '4px 8px' }}><i className="fa-solid fa-list-ol"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('[', '](https://)')} title="Link" style={{ padding: '4px 8px' }}><i className="fa-solid fa-link"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => insertText('| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n')} title="Table" style={{ padding: '4px 8px' }}><i className="fa-solid fa-table"></i></button>
                  <button className="copy-btn btn-sm" onClick={() => setMarkdown('')} title="Clear Editor" style={{ padding: '4px 8px', color: 'var(--accent-red)' }}><i className="fa-solid fa-trash-can"></i></button>
                </div>

                <textarea
                  ref={textareaRef}
                  className="form-textarea"
                  value={markdown}
                  onChange={e => setMarkdown(e.target.value)}
                  onScroll={() => handleScroll('editor')}
                  placeholder="Type Markdown here..."
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    borderRadius: 0,
                    margin: 0,
                    flex: 1,
                    resize: 'none',
                    border: 'none',
                    overflowY: 'auto',
                    minHeight: 0
                  }}
                />

                {/* Editor Statistics */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border-color)',
                  background: 'var(--bg-glass-hover)'
                }}>
                  <span>Words: <strong>{stats.words}</strong></span>
                  <span>Chars: <strong>{stats.chars}</strong></span>
                  <span>Read: <strong>{stats.readingTime}m</strong></span>
                </div>
              </div>
            )}

            {/* Preview Box */}
            {layoutMode !== 'write' && (
              <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Actions Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px',
                  background: 'var(--bg-glass-hover)',
                  borderBottom: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, paddingLeft: '6px' }}>Rendered Preview</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className={`copy-btn btn-sm ${copiedMd ? 'copied' : ''}`} onClick={handleCopyMarkdown} title="Copy Markdown">
                      <i className={copiedMd ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                    </button>
                    <button className={`copy-btn btn-sm ${copiedHtml ? 'copied' : ''}`} onClick={handleCopyHTML} title="Copy HTML">
                      <i className={copiedHtml ? "fa-solid fa-check" : "fa-solid fa-code"}></i>
                    </button>
                    <button className="copy-btn btn-sm" onClick={handleDownload} title="Download Markdown (.md)">
                      <i className="fa-solid fa-file-arrow-down"></i>
                    </button>
                    <button className="copy-btn btn-sm" onClick={handleDownloadHTML} title="Download HTML (.html)">
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button className="copy-btn btn-sm" onClick={handlePrintPDF} title="Print/Export PDF">
                      <i className="fa-solid fa-print"></i>
                    </button>
                  </div>
                </div>

                <div 
                  ref={previewRef}
                  className="result-box markdown-preview" 
                  onScroll={() => handleScroll('preview')}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                    marginTop: 0,
                    minHeight: 0
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Live Markdown Editor — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
