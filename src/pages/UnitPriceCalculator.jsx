import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function UnitPriceCalculator() {
  const [priceA, setPriceA] = useState('');
  const [quantityA, setQuantityA] = useState('');
  const [priceB, setPriceB] = useState('');
  const [quantityB, setQuantityB] = useState('');
  const [unitName, setUnitName] = useState('g'); // e.g. grams, ml, oz, units

  const comparison = useMemo(() => {
    const pA = parseFloat(priceA);
    const qA = parseFloat(quantityA);
    const pB = parseFloat(priceB);
    const qB = parseFloat(quantityB);

    if (isNaN(pA) || isNaN(qA) || isNaN(pB) || isNaN(qB) || qA <= 0 || qB <= 0) return null;

    const unitPriceA = pA / qA;
    const unitPriceB = pB / qB;

    let message = '';
    let percentage = 0;
    let winner = '';

    if (unitPriceA < unitPriceB) {
      winner = 'A';
      percentage = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
      message = `Item A is cheaper by ${percentage.toFixed(1)}% per unit!`;
    } else if (unitPriceB < unitPriceA) {
      winner = 'B';
      percentage = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
      message = `Item B is cheaper by ${percentage.toFixed(1)}% per unit!`;
    } else {
      message = 'Both items have the exact same unit price!';
    }

    return {
      unitPriceA,
      unitPriceB,
      winner,
      percentage,
      message
    };
  }, [priceA, quantityA, priceB, quantityB]);

  const handleReset = () => {
    setPriceA('');
    setQuantityA('');
    setPriceB('');
    setQuantityB('');
  };

  return (
    <div className="tool-page">
      <SEOHead title="Unit Price Calculator" description="Compare two items to find the best value for money. Unit price comparison tool." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Unit Price</span></div>
        <h1><i className="fa-solid fa-scale-balanced" style={{ color: 'var(--accent-purple-light)' }}></i> Unit Price Calculator</h1>
        <p>Compare the price per unit of two products to see which one gives you the best deal.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}>
            {/* Inputs grid */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Product Details</h2>
                <select className="form-select" value={unitName} onChange={e => setUnitName(e.target.value)} style={{ width: '120px', padding: '0.35rem 0.5rem', height: '36px' }}>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="liter">Liters (L)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="units">Units / Items</option>
                </select>
              </div>

              {/* Item A */}
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--accent-purple-light)', marginBottom: '0.5rem' }}>Item A</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Price ($)</label>
                    <input type="number" step="0.01" className="form-input" value={priceA} onChange={e => setPriceA(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantity ({unitName})</label>
                    <input type="number" className="form-input" value={quantityA} onChange={e => setQuantityA(e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>

              {/* Item B */}
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--accent-cyan-light)', marginBottom: '0.5rem' }}>Item B</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Price ($)</label>
                    <input type="number" step="0.01" className="form-input" value={priceB} onChange={e => setPriceB(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantity ({unitName})</label>
                    <input type="number" className="form-input" value={priceB ? (quantityB) : ''} onChange={e => setQuantityB(e.target.value)} placeholder="0" />
                  </div>
                </div>
              </div>

              <button className="copy-btn" onClick={handleReset} style={{ justifyContent: 'center', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <i className="fa-solid fa-rotate-left"></i> Reset values
              </button>
            </div>

            {/* Results */}
            <div className="glass-card workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Comparison Result</h2>

              {comparison ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Results cards */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Item A Unit Price</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${comparison.unitPriceA.toFixed(4)} / {unitName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Item B Unit Price</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${comparison.unitPriceB.toFixed(4)} / {unitName}
                      </div>
                    </div>
                  </div>

                  {/* Winner Display */}
                  <div style={{ padding: '1rem', background: comparison.winner ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-glass-hover)', border: `1px solid ${comparison.winner ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`, borderRadius: '12px', textAlign: 'center' }}>
                    <i className="fa-solid fa-award" style={{ fontSize: '2rem', color: 'var(--accent-green)', marginBottom: '0.5rem', display: 'block' }}></i>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                      {comparison.message}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                  <i className="fa-solid fa-scale-unbalanced" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                  Enter prices and quantities on the left to see which is a better deal.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Unit Price Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
