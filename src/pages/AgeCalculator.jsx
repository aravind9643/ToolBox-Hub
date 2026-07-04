import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';
import ShareButtons from '../components/ShareButtons';

function getZodiacSign(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', symbol: '♈', trait: 'Energetic, brave & optimistic' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', symbol: '♉', trait: 'Reliable, patient & practical' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', symbol: '♊', trait: 'Curious, adaptable & expressive' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', symbol: '♋', trait: 'Intuitive, protective & compassionate' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', symbol: '♌', trait: 'Generous, creative & passionate' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍', trait: 'Loyal, analytical & hardworking' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', symbol: '♎', trait: 'Diplomatic, social & artistic' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', symbol: '♏', trait: 'Brave, resourceful & passionate' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', symbol: '♐', trait: 'Generous, idealistic & funny' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Capricorn', symbol: '♑', trait: 'Responsible, disciplined & manager' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', symbol: '♒', trait: 'Progressive, original & independent' };
  return { name: 'Pisces', symbol: '♓', trait: 'Compassionate, artistic & intuitive' };
}

function getChineseZodiac(year) {
  const animals = [
    { name: 'Monkey', emoji: '🐒', trait: 'Witty, intelligent & versatile' },
    { name: 'Rooster', emoji: '🐓', trait: 'Observant, hardworking & courageous' },
    { name: 'Dog', emoji: '🐕', trait: 'Lovely, honest & prudent' },
    { name: 'Pig', emoji: '🐖', trait: 'Compassionate, generous & diligent' },
    { name: 'Rat', emoji: '🐀', trait: 'Quick-witted, resourceful & versatile' },
    { name: 'Ox', emoji: '🐂', trait: 'Diligent, dependable & strong' },
    { name: 'Tiger', emoji: '🐅', trait: 'Brave, confident & competitive' },
    { name: 'Rabbit', emoji: '🐇', trait: 'Quiet, elegant & responsible' },
    { name: 'Dragon', emoji: '🐉', trait: 'Confident, intelligent & enthusiastic' },
    { name: 'Snake', emoji: '🐍', trait: 'Enigmatic, intelligent & wise' },
    { name: 'Horse', emoji: '🐎', trait: 'Animated, active & energetic' },
    { name: 'Goat', emoji: '🐐', trait: 'Gentle, shy & sympathetic' }
  ];
  return animals[year % 12];
}

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    if (!dob) return;
    const updateLiveAge = () => {
      const birth = new Date(dob);
      const now = new Date();
      if (birth < now) {
        setLiveSeconds(Math.floor((now - birth) / 1000));
      }
    };
    updateLiveAge();
    const interval = setInterval(updateLiveAge, 1000);
    return () => clearInterval(interval);
  }, [dob]);

  const calculate = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (birth >= target) return;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next birthday
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.floor((nextBirthday - target) / (1000 * 60 * 60 * 24));

    // Day of birth
    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });
    const zodiac = getZodiacSign(dob);
    const chineseZodiac = getChineseZodiac(birth.getFullYear());

    setResult({ years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, daysUntilBirthday, dayOfWeek, nextBirthdayAge: years + 1, zodiac, chineseZodiac });
  };

  return (
    <div className="tool-page">
      <SEOHead title="Age Calculator" description="Calculate your exact age in years, months, and days. Find out your next birthday countdown." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Age Calculator</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-cake-candles" style={{ color: 'var(--accent-purple-light)' }}></i> Age Calculator
        </h1>
        <p>Calculate your exact age and details about your birth date.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Calculate Age On</label>
                <input className="form-input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={calculate} style={{ gap: '8px' }}>
              <i className="fa-solid fa-cake-candles"></i> Calculate Age
            </button>

            {result && (
              <>
                <div className="result-box mt-2 text-center">
                  <div className="result-label">Your Age</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 5vw, 2rem)', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    <div>
                      <div className="result-value">{result.years}</div>
                      <div className="result-sub">Years</div>
                    </div>
                    <div>
                      <div className="result-value">{result.months}</div>
                      <div className="result-sub">Months</div>
                    </div>
                    <div>
                      <div className="result-value">{result.days}</div>
                      <div className="result-sub">Days</div>
                    </div>
                  </div>
                </div>

                {liveSeconds > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>⏱️ Live Age Tracker</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan-light)', fontVariantNumeric: 'tabular-nums' }}>
                      {liveSeconds.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>seconds elapsed</span>
                    </div>
                  </div>
                )}

                <div className="stats-grid mt-2">
                  <div className="stat-card"><div className="stat-card-value">{result.totalDays.toLocaleString()}</div><div className="stat-card-label">Total Days</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalWeeks.toLocaleString()}</div><div className="stat-card-label">Total Weeks</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalHours.toLocaleString()}</div><div className="stat-card-label">Total Hours</div></div>
                  <div className="stat-card"><div className="stat-card-value">{result.totalMinutes.toLocaleString()}</div><div className="stat-card-label">Total Minutes</div></div>
                </div>

                <div className="grid-2 mt-2">
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">🎉 Next Birthday In</div>
                    <div className="result-value" style={{ color: 'var(--accent-pink)' }}>{result.daysUntilBirthday}</div>
                    <div className="result-sub">days (turning {result.nextBirthdayAge})</div>
                  </div>
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">📅 Born On</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-cyan)' }}>{result.dayOfWeek}</div>
                    <div className="result-sub">Day of the week</div>
                  </div>
                </div>

                <div className="grid-2 mt-2">
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">✨ Western Zodiac</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-purple-light)', fontSize: '1.3rem' }}>
                      {result.zodiac.symbol} {result.zodiac.name}
                    </div>
                    <div className="result-sub" style={{ fontSize: '0.75rem' }}>{result.zodiac.trait}</div>
                  </div>
                  <div className="result-box text-center" style={{ marginTop: 0 }}>
                    <div className="result-label">🐉 Chinese Zodiac</div>
                    <div className="result-value result-value-sm" style={{ color: 'var(--accent-amber)', fontSize: '1.3rem' }}>
                      {result.chineseZodiac.emoji} {result.chineseZodiac.name}
                    </div>
                    <div className="result-sub" style={{ fontSize: '0.75rem' }}>{result.chineseZodiac.trait}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Age Calculator — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
