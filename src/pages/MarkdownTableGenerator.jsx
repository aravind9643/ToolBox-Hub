import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function MarkdownTableGenerator() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [alignments, setAlignments] = useState(['left', 'center', 'right']);
  
  // Matrix grid values state
  const [grid, setGrid] = useState([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
  ]);

  const [copied, setCopied] = useState(false);

  // Re-adjust grid when rows/cols dimensions are altered
  const handleUpdateDimensions = (newRows, newCols) => {
    let newGrid = [];
    for (let r = 0; r < newRows; r++) {
      let rowData = [];
      for (let c = 0; c < newCols; c++) {
        rowData.push((grid[r] && grid[r][c] !== undefined) ? grid[r][c] : `Cell R${r} C${c}`);
      }
      newGrid.push(rowData);
    }
    setGrid(newGrid);
    setRows(newRows);
    setCols(newCols);

    // Adjust alignments array length
    let newAligns = [...alignments];
    while (newAligns.length < newCols) newAligns.push('left');
    setAlignments(newAligns.slice(0, newCols));
  };

  const handleCellChange = (r, c, val) => {
    const nextGrid = grid.map((row, ri) => 
      row.map((cell, ci) => (ri === r && ci === c) ? val : cell)
    );
    setGrid(nextGrid);
  };

  const handleAlignmentChange = (c, val) => {
    const nextAlign = [...alignments];
    nextAlign[c] = val;
    setAlignments(nextAlign);
  };

  const markdownOutput = useMemo(() => {
    if (grid.length === 0) return '';
    
    // Headers row
    let headers = '| ' + grid[0].join(' | ') + ' |\n';
    
    // Separators row (alignment markers)
    let separators = '|';
    alignments.forEach(align => {
      if (align === 'left') separators += ' :--- |';
      else if (align === 'center') separators += ' :---: |';
      else separators += ' ---: |';
    });
    separators += '\n';

    // Data rows
    let body = '';
    for (let r = 1; r < grid.length; r++) {
      body += '| ' + grid[r].join(' | ') + ' |\n';
    }

    return headers + separators + body;
  }, [grid, alignments]);

  const handleCopy = () => {
    if (!markdownOutput) return;
    navigator.clipboard.writeText(markdownOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Markdown Table Generator & Visual Grid Builder" description="Create formatted Markdown tables using visual grids. Adjust columns alignments and copy markdown syntax easily." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Markdown Table</span></div>
        <h1><i className="fa-solid fa-table" style={{ color: 'var(--accent-purple-light)' }}></i> Markdown Table Generator</h1>
        <p>Edit table contents visually, align columns, and generate Markdown tables for documentation.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Dimensions Control */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Columns</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" max="10"
                  value={cols} 
                  onChange={e => handleUpdateDimensions(rows, Number(e.target.value))} 
                  style={{ height: '32px', fontSize: '0.8rem' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Rows</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" max="20"
                  value={rows} 
                  onChange={e => handleUpdateDimensions(Number(e.target.value), cols)} 
                  style={{ height: '32px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Visual Editor Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  {/* Alignment options row */}
                  <tr>
                    {Array.from({ length: cols }).map((_, c) => (
                      <th key={c} style={{ padding: '0.4rem', textAlign: 'center' }}>
                        <select 
                          className="form-select" 
                          value={alignments[c] || 'left'} 
                          onChange={e => handleAlignmentChange(c, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '0.15rem', height: '24px', minWidth: '80px' }}
                        >
                          <option value="left">Align Left</option>
                          <option value="center">Align Center</option>
                          <option value="right">Align Right</option>
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row, r) => (
                    <tr key={r} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {row.map((cell, c) => (
                        <td key={c} style={{ padding: '0.35rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={cell} 
                            onChange={e => handleCellChange(r, c, e.target.value)} 
                            style={{ 
                              height: '32px', 
                              fontSize: '0.8rem', 
                              fontFamily: r === 0 ? 'inherit' : 'monospace',
                              fontWeight: r === 0 ? 700 : 400,
                              textAlign: alignments[c] || 'left'
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Markdown Output Code Block */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Markdown Output</h3>
                <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} style={{ gap: '4px' }}>
                  <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i> {copied ? 'Copied Markdown' : 'Copy Table'}
                </button>
              </div>

              <textarea 
                className="form-textarea"
                rows="8"
                readOnly
                value={markdownOutput}
                placeholder="Markdown table structure will render here..."
                style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-input)', color: 'var(--accent-cyan-light)', minHeight: '140px' }}
              />
            </div>

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Markdown Table Generator — ToolBox Hub" />
          </div>

        </div>
      </div>
    </div>
  );
}
