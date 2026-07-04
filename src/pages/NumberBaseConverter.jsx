import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function NumberBaseConverter() {
  const [decVal, setDecVal] = useState('42');
  const [binVal, setBinVal] = useState('101010');
  const [octVal, setOctVal] = useState('52');
  const [hexVal, setHexVal] = useState('2a');
  const [copied, setCopied] = useState('');

  const handleDecChange = (val) => {
    setDecVal(val);
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setBinVal(''); setOctVal(''); setHexVal('');
      return;
    }
    setBinVal(num.toString(2));
    setOctVal(num.toString(8));
    setHexVal(num.toString(16));
  };

  const handleBinChange = (val) => {
    setBinVal(val);
    const num = parseInt(val, 2);
    if (isNaN(num)) {
      setDecVal(''); setOctVal(''); setHexVal('');
      return;
    }
    setDecVal(num.toString(10));
    setOctVal(num.toString(8));
    setHexVal(num.toString(16));
  };

  const handleOctChange = (val) => {
    setOctVal(val);
    const num = parseInt(val, 8);
    if (isNaN(num)) {
      setDecVal(''); setBinVal(''); setHexVal('');
      return;
    }
    setDecVal(num.toString(10));
    setBinVal(num.toString(2));
    setHexVal(num.toString(16));
  };

  const handleHexChange = (val) => {
    setHexVal(val);
    const num = parseInt(val, 16);
    if (isNaN(num)) {
      setDecVal(''); setBinVal(''); setOctVal('');
      return;
    }
    setDecVal(num.toString(10));
    setBinVal(num.toString(2));
    setOctVal(num.toString(8));
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  const stepByStep = useMemo(() => {
    const num = parseInt(decVal, 10);
    if (isNaN(num) || num <= 0) return null;

    const steps = [];
    let temp = num;
    while (temp > 0) {
      const quotient = Math.floor(temp / 2);
      const remainder = temp % 2;
      steps.push({ val: temp, quotient, remainder });
      temp = quotient;
    }

    return steps;
  }, [decVal]);

  const fields = [
    { label: 'Decimal (Base 10)', val: decVal, set: handleDecChange, placeholder: 'e.g. 42' },
    { label: 'Binary (Base 2)', val: binVal, set: handleBinChange, placeholder: 'e.g. 101010' },
    { label: 'Octal (Base 8)', val: octVal, set: handleOctChange, placeholder: 'e.g. 52' },
    { label: 'Hexadecimal (Base 16)', val: hexVal, set: handleHexChange, placeholder: 'e.g. 2A' }
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Number Base Converter" description="Convert numbers between Decimal, Binary, Octal, and Hexadecimal. Dynamic live updates with division step explanations." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Base Converter</span></div>
        <h1><i className="fa-solid fa-calculator" style={{ color: 'var(--accent-purple-light)' }}></i> Number Base Converter</h1>
        <p>Convert integers between binary, octal, decimal, and hexadecimal representation.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            {/* Inputs list */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Number Systems</h2>

              {fields.map(({ label, val, set, placeholder }) => (
                <div key={label} className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>{label}</label>
                    <button className="copy-btn btn-sm" onClick={() => val && copy(val, label)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                      {copied === label ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <input type="text" className="form-input" value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={{ fontSize: '1.1rem', fontFamily: 'monospace' }} />
                </div>
              ))}
            </div>

            {/* Explanation panel */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Binary Division Steps</h2>

              {stepByStep ? (
                <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.5rem' }}>Division</th>
                        <th>Quotient</th>
                        <th>Remainder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepByStep.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem' }}>{s.val} / 2</td>
                          <td style={{ color: 'var(--text-muted)' }}>{s.quotient}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-cyan-light)' }}>{s.remainder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Read remainders from bottom to top to get the binary value:&nbsp;
                    <strong style={{ color: 'var(--accent-purple-light)' }}>{binVal}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                  Enter a decimal value on the left to inspect step-by-step division steps.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Number Base Converter — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
