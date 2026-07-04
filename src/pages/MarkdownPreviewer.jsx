import { useState, useMemo, useEffect } from 'react';
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

**Date:** \${new Date().toLocaleDateString()}
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
  const [markdown, setMarkdown] = useState(`# Markdown Previewer\n\nWrite some markdown here to preview it instantly.\n\n## Sub Heading\n- **Bold text**\n- *Italic text*\n- \`Inline code\`\n- > Quote section\n\n\`\`\`javascript\nconst hello = "world";\nconsole.log(hello);\n\`\`\``);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreenEditor(false);
        setIsFullscreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isFullscreenEditor || isFullscreenPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreenEditor, isFullscreenPreview]);

  const html = useMemo(() => {
    try {
      return marked.parse(markdown || '');
    } catch (e) {
      console.error(e);
      return '';
    }
  }, [markdown]);

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('.markdown-preview pre code');
    codeBlocks.forEach((block) => {
      block.removeAttribute('data-highlighted');
      hljs.highlightElement(block);
    });
  }, [html]);

  const stats = useMemo(() => {
    const raw = markdown || '';
    const chars = raw.length;
    const words = raw.trim() === '' ? 0 : raw.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readingTime };
  }, [markdown]);

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('md-textarea');
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
      <SEOHead title="Markdown Previewer" description="Write and preview Markdown formatting instantly. Free browser-based editor." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Markdown Previewer</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-file-code" style={{ color: 'var(--accent-purple-light)' }}></i> Markdown Previewer
        </h1>
        <p>Live Markdown editor and preview tool.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          {/* Tabs selector on mobile/tablet viewports */}
          <div className="workspace-tabs tabs" style={{ marginBottom: '1.25rem' }}>
            <button className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`} onClick={() => setActiveTab('write')}>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i> Write
            </button>
            <button className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
              <i className="fa-solid fa-eye" style={{ marginRight: '6px' }}></i> Preview
            </button>
          </div>

          {/* Main Workspace */}
          <div className="markdown-workspace">
            
            {/* Editor Side */}
            <div className={`glass-card workspace-column ${isFullscreenEditor ? 'fullscreen-mode' : ''} ${activeTab === 'preview' ? 'inactive' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Editor {isFullscreenEditor && <span className="fullscreen-badge">Fullscreen</span>}</h2>
                
                {/* Templates Selector */}
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-secondary">Template:</span>
                  <select 
                    className="form-select text-xs" 
                    onChange={e => e.target.value && setMarkdown(templates[e.target.value])}
                    style={{ padding: '0.25rem 1.5rem 0.25rem 0.5rem', width: 'auto', minWidth: '110px', height: '28px', fontSize: '0.75rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose...</option>
                    <option value="readme">README.md</option>
                    <option value="meeting">Meeting Sync</option>
                    <option value="todo">Task list</option>
                  </select>
                  <button 
                    className={`copy-btn btn-sm ${isFullscreenEditor ? 'active' : ''}`}
                    onClick={() => {
                      setIsFullscreenEditor(!isFullscreenEditor);
                      setIsFullscreenPreview(false);
                    }}
                    title={isFullscreenEditor ? "Exit Fullscreen (Esc)" : "Fullscreen Editor"}
                    style={{ height: '28px' }}
                  >
                    <i className={isFullscreenEditor ? "fa-solid fa-compress" : "fa-solid fa-expand"}></i>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div style={{
                display: 'flex',
                gap: '4px',
                padding: '6px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderBottom: 'none',
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
                <button className="copy-btn btn-sm" onClick={() => insertText('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n')} title="Table" style={{ padding: '4px 8px' }}><i className="fa-solid fa-table"></i></button>
                <button className="copy-btn btn-sm" onClick={() => setMarkdown('')} title="Clear Editor" style={{ padding: '4px 8px', color: 'var(--accent-red)' }}><i className="fa-solid fa-trash-can"></i></button>
              </div>

              <textarea
                id="md-textarea"
                className="form-textarea"
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Type Markdown here..."
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  margin: 0,
                  flex: 1,
                  resize: 'none',
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
                border: '1px solid var(--border-color)',
                borderTop: 'none',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                background: 'var(--bg-glass)'
              }}>
                <span>Words: <strong>{stats.words}</strong></span>
                <span>Characters: <strong>{stats.chars}</strong></span>
                <span>Reading Time: <strong>{stats.readingTime}m</strong></span>
              </div>
            </div>
            
            {/* Preview Side */}
            <div className={`glass-card workspace-column ${isFullscreenPreview ? 'fullscreen-mode' : ''} ${activeTab === 'write' ? 'inactive' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Preview {isFullscreenPreview && <span className="fullscreen-badge">Fullscreen</span>}</h2>
                
                {/* Action buttons */}
                <div className="flex gap-1 flex-wrap">
                  <button className={`copy-btn btn-sm ${copiedMd ? 'copied' : ''}`} onClick={handleCopyMarkdown} title="Copy Markdown">
                    <i className={copiedMd ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> MD
                  </button>
                  <button className={`copy-btn btn-sm ${copiedHtml ? 'copied' : ''}`} onClick={handleCopyHTML} title="Copy HTML">
                    <i className={copiedHtml ? "fa-solid fa-check" : "fa-solid fa-code"}></i> HTML
                  </button>
                  <button className="copy-btn btn-sm" onClick={handleDownload} title="Download Markdown (.md)">
                    <i className="fa-solid fa-file-arrow-down"></i> .MD
                  </button>
                  <button className="copy-btn btn-sm" onClick={handleDownloadHTML} title="Download HTML Page (.html)">
                    <i className="fa-solid fa-file-code"></i> .HTML
                  </button>
                  <button className="copy-btn btn-sm" onClick={handlePrintPDF} title="Print / Export PDF">
                    <i className="fa-solid fa-print"></i> PDF
                  </button>
                  <button 
                    className={`copy-btn btn-sm ${isFullscreenPreview ? 'active' : ''}`} 
                    onClick={() => {
                      setIsFullscreenPreview(!isFullscreenPreview);
                      setIsFullscreenEditor(false);
                    }}
                    title={isFullscreenPreview ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
                  >
                    <i className={isFullscreenPreview ? "fa-solid fa-compress" : "fa-solid fa-expand"}></i> {isFullscreenPreview ? 'Minimize' : 'Fullscreen'}
                  </button>
                </div>
              </div>

              <div 
                className="result-box markdown-preview" 
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)',
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
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Live Markdown Previewer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
