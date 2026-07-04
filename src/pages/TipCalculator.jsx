import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState(1);
  const [customTip, setCustomTip] = useState('');

  const activeTip = useMemo(() => {
    return tipPercent === 'custom' ? (parseFloat(customTip) || 0) : tipPercent;
  }, [tipPercent, customTip]);

  const results = useMemo(() => {
    const billAmount = parseFloat(bill) || 0;
    const peopleCount = Math.max(1, parseInt(people) || 1);
    
    const tipAmount = (billAmount * activeTip) / 100;
    const totalBill = billAmount + tipAmount;
    
    return {
      tipTotal: tipAmount,
      tipPerPerson: tipAmount / peopleCount,
      billTotal: totalBill,
      billPerPerson: totalBill / peopleCount
    };
  }, [bill, activeTip, people]);

  const handleReset = () => {
    setBill('');
    setTipPercent(15);
    setPeople(1);
    setCustomTip('');
  };

  return (
    <div className="tool-page">
      <SEOHead title="Tip Calculator" description="Quickly split bills and calculate tips per person. Custom percentage slider and instant results." />
      
      <div className="tool-page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Tip Calculator</span>
        </div>
        <h1>
          <i className="fa-solid fa-coins" style={{ color: 'var(--accent-purple-light)' }}></i> Tip Splitter & Calculator
        </h1>
        <p>Quickly calculate tips and split bills with friends.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
            {/* Input card */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Bill Details</h2>
              
              <div className="form-group">
                <label className="form-label" htmlFor="bill-amount">Bill Amount ($)</label>
                <input
                  id="bill-amount"
                  type="number"
                  placeholder="0.00"
                  value={bill}
                  onChange={(e) => setBill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tip Percentage ({activeTip}%)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {[10, 15, 18, 20].map((p) => (
                    <button
                      key={p}
                      className={`copy-btn ${tipPercent === p ? 'active' : ''}`}
                      onClick={() => setTipPercent(p)}
                      style={{
                        flex: 1,
                        minWidth: '60px',
                        padding: '0.5rem',
                        justifyContent: 'center',
                        borderColor: tipPercent === p ? 'var(--accent-purple-light)' : 'var(--border-color)',
                        background: tipPercent === p ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                      }}
                    >
                      {p}%
                    </button>
                  ))}
                  <button
                    className={`copy-btn ${tipPercent === 'custom' ? 'active' : ''}`}
                    onClick={() => setTipPercent('custom')}
                    style={{
                      flex: 1,
                      minWidth: '70px',
                      padding: '0.5rem',
                      justifyContent: 'center',
                      borderColor: tipPercent === 'custom' ? 'var(--accent-purple-light)' : 'var(--border-color)',
                      background: tipPercent === 'custom' ? 'rgba(96, 165, 250, 0.1)' : 'var(--bg-glass)'
                    }}
                  >
                    Custom
                  </button>
                </div>

                {tipPercent === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--accent-purple-light)' }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '80px',
                        padding: '0.4rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="people-count">Number of People</label>
                <input
                  id="people-count"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button
                className="copy-btn"
                onClick={handleReset}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  color: 'var(--accent-red)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                <i className="fa-solid fa-arrow-rotate-left"></i> Reset Calculator
              </button>
            </div>

            {/* Results card */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Summary</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Tip Per Person */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Tip Amount</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>per person</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
                      ${results.tipPerPerson.toFixed(2)}
                    </div>
                  </div>

                  {/* Total Bill Per Person */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Total Bill</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>per person</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan-light)' }}>
                      ${results.billPerPerson.toFixed(2)}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                  {/* Overall Tip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Tip (All)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${results.tipTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Overall Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Bill (All)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${results.billTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div style={{
                padding: '1rem',
                background: 'var(--bg-glass-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-purple-light)', marginRight: '6px' }}></i>
                Calculations are done entirely in your browser. No data is stored or sent to any server.
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Tip Splitter & Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
