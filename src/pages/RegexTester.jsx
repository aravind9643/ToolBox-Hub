import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

export default function RegexTester() {
  const [regex, setRegex] = useState('([a-zA-Z]+)\\s*(\\d+)');
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
    y: false
  });
  const [text, setText] = useState('Hello 2026, welcome to the regex tester 101.');
  const [substitutionText, setSubstitutionText] = useState('word-$1-num-$2');
  const [enableSubstitution, setEnableSubstitution] = useState(true);
  const [showFlagsDropdown, setShowFlagsDropdown] = useState(false);
  const [cheatSheetQuery, setCheatSheetQuery] = useState('');
  const [activeCheatCategory, setActiveCheatCategory] = useState('All');
  const [hoveredMatchIndex, setHoveredMatchIndex] = useState(null);
  const [copiedRegex, setCopiedRegex] = useState(false);

  const handleRegexChange = (e) => {
    const value = e.target.value;
    const match = value.match(/^\/(.*)\/([gimsuy]*)$/);
    if (match) {
      const parsedPattern = match[1];
      const parsedFlags = match[2];
      setRegex(parsedPattern);
      setFlags({
        g: parsedFlags.includes('g'),
        i: parsedFlags.includes('i'),
        m: parsedFlags.includes('m'),
        s: parsedFlags.includes('s'),
        u: parsedFlags.includes('u'),
        y: parsedFlags.includes('y'),
      });
    } else {
      setRegex(value);
    }
  };

  const handleCopyFullRegex = () => {
    const full = `/${regex}/${activeFlagsString}`;
    navigator.clipboard.writeText(full);
    setCopiedRegex(true);
    setTimeout(() => setCopiedRegex(false), 2000);
  };

  const flagDescriptions = {
    g: 'global. All matches (don\'t return on first match)',
    i: 'insensitive. Case insensitive match (ignores case of [a-z])',
    m: 'multi-line. Causes ^ and $ to match begin/end of each line',
    s: 'single-line. Causes . to match newlines as well',
    u: 'unicode. Pattern treated as a list of Unicode code points',
    y: 'sticky. Matches only from the index indicated by lastIndex'
  };

  const cheatSheet = [
    { token: '\\d', desc: 'Any digit (0-9)', category: 'Characters' },
    { token: '\\D', desc: 'Any non-digit', category: 'Characters' },
    { token: '\\w', desc: 'Alphanumeric & underscore', category: 'Characters' },
    { token: '\\W', desc: 'Any non-word character', category: 'Characters' },
    { token: '\\s', desc: 'Any whitespace (space, tab, newline)', category: 'Characters' },
    { token: '\\S', desc: 'Any non-whitespace', category: 'Characters' },
    { token: '.', desc: 'Any character except newline', category: 'Characters' },
    { token: '[a-z]', desc: 'Lowercase letters range', category: 'Sets' },
    { token: '[0-9]', desc: 'Numbers range', category: 'Sets' },
    { token: '[^abc]', desc: 'Not a, b, or c', category: 'Sets' },
    { token: '^', desc: 'Start of line/string', category: 'Anchors' },
    { token: '$', desc: 'End of line/string', category: 'Anchors' },
    { token: '\\b', desc: 'Word boundary', category: 'Anchors' },
    { token: '\\B', desc: 'Non-word boundary', category: 'Anchors' },
    { token: '*', desc: '0 or more times', category: 'Quantifiers' },
    { token: '+', desc: '1 or more times', category: 'Quantifiers' },
    { token: '?', desc: '0 or 1 time (optional)', category: 'Quantifiers' },
    { token: '{3}', desc: 'Exactly 3 times', category: 'Quantifiers' },
    { token: '{3,}', desc: '3 or more times', category: 'Quantifiers' },
    { token: '{3,5}', desc: 'Between 3 and 5 times', category: 'Quantifiers' },
    { token: '(x)', desc: 'Capture group x', category: 'Groups' },
    { token: '(?:x)', desc: 'Non-capturing group x', category: 'Groups' },
    { token: 'x|y', desc: 'Match x or y', category: 'Groups' },
  ];

  const activeFlagsString = useMemo(() => {
    return Object.keys(flags).filter(k => flags[k]).join('');
  }, [flags]);

  const toggleFlag = (flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const results = useMemo(() => {
    if (!regex) return { matches: [], error: '' };
    try {
      const re = new RegExp(regex, activeFlagsString);
      const matches = [];
      let match;

      if (activeFlagsString.includes('g')) {
        let lastIndex = -1;
        while ((match = re.exec(text)) !== null) {
          if (match[0] === '') {
            if (re.lastIndex === lastIndex) {
              re.lastIndex++;
            }
          }
          lastIndex = re.lastIndex;
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = text.match(re);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index || 0,
            groups: match.slice(1)
          });
        }
      }

      return { matches, error: '' };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [regex, activeFlagsString, text]);

  // Color palette for multiple match highlights (regex101 style color cycles)
  const matchColors = [
    { bg: 'rgba(56, 189, 248, 0.25)', border: 'var(--accent-cyan-light)', text: '#0284c7' },
    { bg: 'rgba(16, 185, 129, 0.25)', border: 'var(--accent-green)', text: '#059669' },
    { bg: 'rgba(245, 158, 11, 0.25)', border: 'var(--accent-amber)', text: '#d97706' },
    { bg: 'rgba(217, 70, 239, 0.25)', border: 'var(--accent-pink)', text: '#c026d3' }
  ];

  const highlightedText = useMemo(() => {
    if (!regex || results.error || results.matches.length === 0) return text;
    try {
      const re = new RegExp(regex, activeFlagsString);
      const matchRanges = [];
      let match;

      if (activeFlagsString.includes('g')) {
        let lastIndex = -1;
        while ((match = re.exec(text)) !== null) {
          if (match[0] === '') {
            if (re.lastIndex === lastIndex) re.lastIndex++;
          }
          lastIndex = re.lastIndex;
          matchRanges.push({ start: match.index, end: match.index + match[0].length });
        }
      } else {
        match = text.match(re);
        if (match) {
          matchRanges.push({ start: match.index || 0, end: (match.index || 0) + match[0].length });
        }
      }

      const elements = [];
      let lastIdx = 0;
      matchRanges.forEach((range, idx) => {
        if (range.start > lastIdx) {
          elements.push(text.substring(lastIdx, range.start));
        }
        const color = matchColors[idx % matchColors.length];
        const isHovered = idx === hoveredMatchIndex;
        elements.push(
          <span
            key={idx}
            onMouseEnter={() => setHoveredMatchIndex(idx)}
            onMouseLeave={() => setHoveredMatchIndex(null)}
            style={{
              background: isHovered ? 'rgba(124, 58, 237, 0.4)' : color.bg,
              borderBottom: `2px solid ${isHovered ? 'var(--accent-purple-light)' : color.border}`,
              borderRadius: '2px',
              padding: '1px 0',
              color: 'var(--text-primary)',
              cursor: 'help',
              transition: 'all 0.15s'
            }}
            title={`Match ${idx + 1}`}
          >
            {text.substring(range.start, range.end)}
          </span>
        );
        lastIdx = range.end;
      });
      if (lastIdx < text.length) {
        elements.push(text.substring(lastIdx));
      }
      return elements;
    } catch (e) {
      return text;
    }
  }, [regex, activeFlagsString, text, results, hoveredMatchIndex]);

  // substitution output
  const substitutedText = useMemo(() => {
    if (!regex || results.error) return text;
    try {
      const re = new RegExp(regex, activeFlagsString);
      return text.replace(re, substitutionText);
    } catch (e) {
      return text;
    }
  }, [regex, activeFlagsString, text, substitutionText]);

  // Syntax highlighting for the regex expression input itself
  const highlightedRegexPattern = useMemo(() => {
    if (!regex) return <span style={{ color: 'var(--text-muted)' }}>pattern</span>;

    // Simple scanner to color-code groups, sets, and quantifiers
    const parts = [];
    let current = '';

    for (let i = 0; i < regex.length; i++) {
      const ch = regex[i];
      if (ch === '(' || ch === ')') {
        if (current) { parts.push(<span key={i + '_c'}>{current}</span>); current = ''; }
        parts.push(<span key={i} style={{ color: 'var(--accent-purple-light)', fontWeight: 'bold' }}>{ch}</span>);
      } else if (ch === '[' || ch === ']') {
        if (current) { parts.push(<span key={i + '_c'}>{current}</span>); current = ''; }
        parts.push(<span key={i} style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>{ch}</span>);
      } else if (ch === '+' || ch === '*' || ch === '?' || ch === '{' || ch === '}') {
        if (current) { parts.push(<span key={i + '_c'}>{current}</span>); current = ''; }
        parts.push(<span key={i} style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{ch}</span>);
      } else if (ch === '\\') {
        if (current) { parts.push(<span key={i + '_c'}>{current}</span>); current = ''; }
        // get escaped char
        const next = regex[i + 1] || '';
        parts.push(<span key={i} style={{ color: 'var(--accent-cyan-light)', fontWeight: 'bold' }}>\\{next}</span>);
        i++;
      } else {
        current += ch;
      }
    }
    if (current) {
      parts.push(<span key="final">{current}</span>);
    }
    return parts;
  }, [regex]);



  // Generate detailed regex breakdown tree explanation (regex101 format)
  const regexExplanation = useMemo(() => {
    const explanations = [];
    if (!regex) return explanations;

    let groupCount = 0;

    if (regex.startsWith('^')) {
      explanations.push({ token: '^', label: 'Assert position at start of line/string' });
    }

    const scanTokens = (str) => {
      let groupRegex = /\((?!\?:)([^)]+)\)/g;
      let match;
      while ((match = groupRegex.exec(str)) !== null) {
        groupCount++;
        explanations.push({
          token: `(${match[1]})`,
          label: `${groupCount}st Capturing Group`,
          details: `Matches "${match[1]}"`,
          children: [
            { token: match[1], label: `Pattern match details inside Group ${groupCount}` }
          ]
        });
      }

      if (str.includes('+')) {
        explanations.push({ token: '+', label: 'Quantifier — Matches between one and unlimited times' });
      }
      if (str.includes('*')) {
        explanations.push({ token: '*', label: 'Quantifier — Matches between zero and unlimited times' });
      }
      if (str.includes('?')) {
        explanations.push({ token: '?', label: 'Quantifier — Matches between zero and one time (optional)' });
      }
      if (str.includes('\\d')) {
        explanations.push({ token: '\\d', label: 'Matches any digit (0-9)' });
      }
      if (str.includes('\\w')) {
        explanations.push({ token: '\\w', label: 'Matches any word character (alphanumeric & underscore)' });
      }
      if (str.includes('\\s')) {
        explanations.push({ token: '\\s', label: 'Matches any whitespace character (space, tab, newline)' });
      }
      if (str.includes('[a-zA-Z]')) {
        explanations.push({ token: '[a-zA-Z]', label: 'Character Set — Matches letters from a to z or A to Z' });
      }
    };

    scanTokens(regex);

    if (regex.endsWith('$')) {
      explanations.push({ token: '$', label: 'Assert position at end of line/string' });
    }

    if (explanations.length === 0) {
      explanations.push({ token: regex, label: 'Standard literal string pattern match' });
    }

    return explanations;
  }, [regex]);

  const insertToken = (token) => {
    setRegex(prev => prev + token);
  };

  const filteredCheatSheet = useMemo(() => {
    return cheatSheet.filter(item => {
      const matchQuery = !cheatSheetQuery ||
        item.token.toLowerCase().includes(cheatSheetQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(cheatSheetQuery.toLowerCase());
      const matchCategory = activeCheatCategory === 'All' || item.category === activeCheatCategory;
      return matchQuery && matchCategory;
    });
  }, [cheatSheetQuery, activeCheatCategory]);

  return (
    <div className="tool-page">
      <SEOHead title="Regex101 Clone — Real-time Regular Expression Debugger" description="Interactive Regex101 style debugger with live color-coded matches, flags dropdowns, substitutions, and pattern tree explanations." />

      <div className="tool-page-header" style={{ marginBottom: '1rem' }}>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Regex Tester</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1><i className="fa-solid fa-square-poll-vertical" style={{ color: 'var(--accent-purple-light)' }}></i> Regex Tester</h1>
            <p>Deconstruct, test, substitute and compile regular expressions client-side.</p>
          </div>
        </div>
      </div>

      <AdBanner type="header" />

      {/* Main 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.25rem' }}>

        {/* Left Column: Pattern, String, Substitutions, Code Snippets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="glass-card" style={{ padding: '1.25rem' }}>

            {/* REGEX INPUT CONTAINER */}
            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>REGULAR EXPRESSION</label>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  Preview: <span style={{ padding: '2px 6px', background: 'var(--bg-input)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>/{highlightedRegexPattern}/{activeFlagsString}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 0.75rem',
                height: '42px'
              }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 600, paddingRight: '0.4rem' }}>/</span>
                <input
                  type="text"
                  value={regex}
                  onChange={handleRegexChange}
                  placeholder="insert pattern here..."
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    padding: 0
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 600, paddingLeft: '0.4rem', paddingRight: '0.6rem' }}>/</span>

                {/* Flags Selector Button */}
                <button
                  onClick={() => setShowFlagsDropdown(!showFlagsDropdown)}
                  style={{
                    background: 'var(--bg-glass-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    color: 'var(--accent-purple-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginRight: '8px'
                  }}
                >
                  {activeFlagsString || 'no flags'} <i className="fa-solid fa-caret-down"></i>
                </button>

                {/* Copy Regex Button */}
                <button
                  onClick={handleCopyFullRegex}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-purple-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  title="Copy full regular expression (/pattern/flags)"
                >
                  <i className={copiedRegex ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                </button>
              </div>

              {/* Flags Selector Dropdown */}
              {showFlagsDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '70px',
                  zIndex: 200,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '320px',
                  padding: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expression Flags</span>
                    <button onClick={() => setShowFlagsDropdown(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {Object.keys(flagDescriptions).map(f => (
                      <label key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={flags[f]}
                          onChange={() => toggleFlag(f)}
                          style={{ marginTop: '2px', accentColor: 'var(--accent-purple-light)' }}
                        />
                        <div>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--accent-purple-light)' }}>{f}</strong> - <span style={{ color: 'var(--text-secondary)' }}>{flagDescriptions[f]}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {results.error && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {results.error}
                </div>
              )}
            </div>

            {/* TEST STRING CONTAINER */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>TEST STRING</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter string here..."
                style={{ fontSize: '0.9rem', fontFamily: 'monospace', minHeight: '80px' }}
              />
            </div>

            {/* LIVE HIGHLIGHT PREVIEW */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>LIVE HIGHLIGHTED PREVIEW</label>
              <div style={{
                padding: '1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                minHeight: '80px',
                border: '1px solid var(--border-color)',
                whiteSpace: 'pre-wrap',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                {highlightedText}
              </div>
            </div>

            {/* SUBSTITUTION PANEL */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>SUBSTITUTION / REPLACE</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enableSubstitution}
                    onChange={e => setEnableSubstitution(e.target.checked)}
                    style={{ accentColor: 'var(--accent-purple-light)' }}
                  />
                  <span>Enable Substitution</span>
                </label>
              </div>

              {enableSubstitution && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Replacement String</label>
                    <input
                      className="form-input"
                      type="text"
                      value={substitutionText}
                      onChange={e => setSubstitutionText(e.target.value)}
                      placeholder="e.g. replaced-$1"
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Substituted Result</label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '60px',
                      border: '1px solid var(--border-color)',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}>
                      {substitutedText}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Explanations & Match details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Explanation Tree */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
              <i className="fa-solid fa-tree"></i> EXPLANATION
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', lineHeight: 1.4 }}>
              {regexExplanation.map((exp, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <code style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>{exp.token}</code>
                    <span style={{ color: 'var(--text-primary)' }}>{exp.label}</span>
                  </div>
                  {exp.details && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {exp.details}
                    </div>
                  )}
                  {exp.children && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '8px' }}>
                      {exp.children.map((c, cIdx) => (
                        <div key={cIdx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Match Captures panel */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
              <i className="fa-solid fa-list-check"></i> MATCH INFORMATION
            </h3>

            {results.matches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.matches.map((m, idx) => {
                  const color = matchColors[idx % matchColors.length];
                  const isHovered = idx === hoveredMatchIndex;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredMatchIndex(idx)}
                      onMouseLeave={() => setHoveredMatchIndex(null)}
                      style={{
                        border: `1px solid ${isHovered ? 'var(--accent-purple-light)' : color.border}`,
                        borderRadius: 'var(--radius-sm)',
                        background: isHovered ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-input)',
                        padding: '0.5rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color.text }}>Match {idx + 1}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Index: {m.index}-{m.index + m.value.length}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        "{m.value}"
                      </div>

                      {m.groups.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '4px' }}>
                          {m.groups.map((g, gIdx) => (
                            <div key={gIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              <span style={{ fontFamily: 'monospace' }}>Group {gIdx + 1}:</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>"{g || 'null'}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem' }}>
                No active matches captured.
              </div>
            )}
          </div>

          {/* Quick Cheat Sheet Library */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>QUICK REFERENCE</span>
              <input
                type="text"
                className="form-input"
                placeholder="Search..."
                value={cheatSheetQuery}
                onChange={e => setCheatSheetQuery(e.target.value)}
                style={{ maxWidth: '120px', height: '28px', padding: '2px 8px', fontSize: '0.75rem' }}
              />
            </div>

            {/* Cheat Sheet Categories chips */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {['All', 'Characters', 'Sets', 'Anchors', 'Quantifiers', 'Groups'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCheatCategory(cat)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    background: activeCheatCategory === cat ? 'var(--accent-purple-light)' : 'var(--bg-input)',
                    color: activeCheatCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredCheatSheet.map(item => (
                <button
                  key={item.token}
                  onClick={() => insertToken(item.token)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-input)'}
                >
                  <code style={{ color: 'var(--accent-purple-light)', fontWeight: 600, fontSize: '0.75rem' }}>{item.token}</code>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      <div className="glass-card mt-2">
        <h3>Share this tool</h3>
        <ShareButtons title="Regex Tester — ToolBox Hub" />
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
