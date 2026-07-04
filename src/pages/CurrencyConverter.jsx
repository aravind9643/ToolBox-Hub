import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';

// Exchange rates relative to USD (approximate, as of mid-2025)
const RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 157.5, INR: 83.5, CAD: 1.37, AUD: 1.55,
  CHF: 0.90, CNY: 7.26, HKD: 7.82, SGD: 1.35, MXN: 17.1, BRL: 5.05, KRW: 1350,
  SEK: 10.5, NOK: 10.8, DKK: 6.88, NZD: 1.65, ZAR: 18.6, AED: 3.67, SAR: 3.75,
  THB: 35.8, MYR: 4.71, IDR: 16200, PHP: 58.5, TRY: 32.5, PLN: 3.95, HUF: 360,
  CZK: 23.1, ILS: 3.72, RUB: 89.5, VND: 25400, EGP: 30.9, NGN: 1500, PKR: 278
};

const SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$',
  CHF: 'Fr', CNY: '¥', HKD: 'HK$', SGD: 'S$', MXN: 'MX$', BRL: 'R$', KRW: '₩',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', NZD: 'NZ$', ZAR: 'R', AED: 'د.إ', SAR: '﷼',
  THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱', TRY: '₺', PLN: 'zł', HUF: 'Ft',
  CZK: 'Kč', ILS: '₪', RUB: '₽', VND: '₫', EGP: 'E£', NGN: '₦', PKR: '₨'
};

const NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  INR: 'Indian Rupee', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
  CHF: 'Swiss Franc', CNY: 'Chinese Yuan', HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar', MXN: 'Mexican Peso', BRL: 'Brazilian Real',
  KRW: 'South Korean Won', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
  DKK: 'Danish Krone', NZD: 'New Zealand Dollar', ZAR: 'South African Rand',
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', THB: 'Thai Baht', MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso', TRY: 'Turkish Lira',
  PLN: 'Polish Zloty', HUF: 'Hungarian Forint', CZK: 'Czech Koruna',
  ILS: 'Israeli Shekel', RUB: 'Russian Ruble', VND: 'Vietnamese Dong',
  EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', PKR: 'Pakistani Rupee'
};

const CURRENCIES = Object.keys(RATES);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');

  const converted = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num)) return null;
    const inUSD = num / RATES[from];
    return inUSD * RATES[to];
  }, [amount, from, to]);

  const allConverted = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num)) return [];
    const inUSD = num / RATES[from];
    return CURRENCIES.filter(c => c !== from)
      .filter(c => !search || c.includes(search.toUpperCase()) || NAMES[c].toLowerCase().includes(search.toLowerCase()))
      .map(c => ({ code: c, name: NAMES[c], symbol: SYMBOLS[c], val: inUSD * RATES[c] }));
  }, [amount, from, search]);

  const swap = () => { setFrom(to); setTo(from); };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  const formatVal = (val, code) => {
    if (val >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (val < 0.01) return val.toFixed(6);
    return val.toFixed(2);
  };

  return (
    <div className="tool-page">
      <SEOHead title="Currency Converter" description="Convert between 35+ world currencies offline. Approximate exchange rates included." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Currency Converter</span></div>
        <h1><i className="fa-solid fa-money-bill-transfer" style={{ color: 'var(--accent-purple-light)' }}></i> Currency Converter</h1>
        <p>Convert between 35+ world currencies. Works 100% offline with approximate rates.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.3rem 0.7rem', background: 'var(--bg-input)', borderRadius: '9999px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-amber)' }}></i>
              Approximate rates — not for financial transactions. Updated mid-2025.
            </div>

            {/* Main Converter */}
            <div className="converter-row">
              <div style={{ flex: 1 }}>
                <label className="form-label">Amount</label>
                <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1.00" style={{ fontSize: '1.2rem', fontWeight: 600 }} />
                <select className="form-select" style={{ marginTop: '0.5rem' }} value={from} onChange={e => setFrom(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c} — {NAMES[c]}</option>)}
                </select>
              </div>

              <button className="converter-swap" onClick={swap} title="Swap currencies">
                <i className="fa-solid fa-arrow-right-arrow-left"></i>
              </button>

              <div style={{ flex: 1 }}>
                <label className="form-label">Converted To</label>
                <div className="result-box" style={{ marginTop: 0, cursor: 'pointer' }} onClick={() => converted && copy(`${formatVal(converted, to)} ${to}`, 'main')}>
                  <div className="result-label">{SYMBOLS[to]} {NAMES[to]}</div>
                  <div className="result-value result-value-sm" style={{ color: 'var(--accent-purple-light)' }}>
                    {converted !== null ? `${SYMBOLS[to]} ${formatVal(converted, to)}` : '—'}
                  </div>
                  <div className="result-sub">{copied === 'main' ? '✓ Copied!' : 'Click to copy'}</div>
                </div>
                <select className="form-select" style={{ marginTop: '0.5rem' }} value={to} onChange={e => setTo(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c} — {NAMES[c]}</option>)}
                </select>
              </div>
            </div>

            {/* Quick rate */}
            {converted !== null && (
              <div className="result-box mt-2 text-center" style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  1 {from} = <strong style={{ color: 'var(--text-primary)' }}>{formatVal(RATES[to] / RATES[from], to)} {to}</strong>
                  &nbsp;·&nbsp;
                  1 {to} = <strong style={{ color: 'var(--text-primary)' }}>{formatVal(RATES[from] / RATES[to], from)} {from}</strong>
                </span>
              </div>
            )}

            {/* All currencies table */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem' }}>All Currencies ({amount} {from})</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: '0.35rem 0.6rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.8rem', width: '130px' }} />
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAll(s => !s)}>{showAll ? 'Show Less' : 'Show All'}</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {(showAll ? allConverted : allConverted.slice(0, 12)).map(({ code, name, symbol, val }) => (
                  <div key={code} className="stat-card" style={{ cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => copy(`${formatVal(val, code)} ${code}`, code)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{code}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--accent-cyan-light)', fontSize: '0.9rem' }}>{symbol} {formatVal(val, code)}</div>
                        <div style={{ fontSize: '0.6rem', color: copied === code ? 'var(--accent-green)' : 'var(--text-muted)' }}>{copied === code ? '✓ Copied' : 'click'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
