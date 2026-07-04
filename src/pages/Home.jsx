import ToolCard from '../components/ToolCard';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const tools = [
  {
    icon: 'fa-solid fa-qrcode', title: 'QR Code Generator', path: '/qr-code-generator',
    description: 'Generate QR codes for URLs, text, WiFi credentials, and more.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-shield-halved', title: 'Password Generator', path: '/password-generator',
    description: 'Create strong, secure passwords with customizable options.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-ruler-combined', title: 'Unit Converter', path: '/unit-converter',
    description: 'Convert between units of length, weight, temperature, and more.',
    color: '#0ea5e9'
  },
  {
    icon: 'fa-solid fa-eye-dropper', title: 'Color Picker', path: '/color-picker',
    description: 'Pick colors and convert between HEX, RGB, and HSL formats.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-weight-scale', title: 'BMI Calculator', path: '/bmi-calculator',
    description: 'Calculate your Body Mass Index and get health insights.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-cake-candles', title: 'Age Calculator', path: '/age-calculator',
    description: 'Calculate your exact age in years, months, and days.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-coins', title: 'Loan Calculator', path: '/loan-calculator',
    description: 'Calculate EMI, total interest, and amortization schedules.',
    color: '#0ea5e9'
  },
  {
    icon: 'fa-solid fa-chart-line', title: 'Compound Interest Calculator', path: '/compound-interest-calculator',
    description: 'Calculate compounding interest growth with dynamic projections.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-coins', title: 'Tip Splitter & Calculator', path: '/tip-calculator',
    description: 'Quickly split bills and calculate tips per person.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-calendar-days', title: 'Date & Business Days Calculator', path: '/date-calculator',
    description: 'Calculate durations, business days, or add/subtract time.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-calculator', title: 'TDEE & Calorie Calculator', path: '/tdee-calculator',
    description: 'Estimate daily caloric expenditure and macro splits.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-paragraph', title: 'Word Counter', path: '/word-counter',
    description: 'Count words, characters, sentences, and reading time.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-code', title: 'JSON Formatter', path: '/json-formatter',
    description: 'Format, validate, and beautify JSON data instantly.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-file-image', title: 'Image Compressor', path: '/image-compressor',
    description: 'Compress images in your browser. No upload to any server.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-right-left', title: 'Base64 Converter', path: '/base64-converter',
    description: 'Encode and decode text or files to/from Base64 format.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-file-lines', title: 'Lorem Ipsum Generator', path: '/lorem-ipsum',
    description: 'Generate placeholder text for your designs and mockups.',
    color: '#0ea5e9'
  },
  {
    icon: 'fa-solid fa-clock', title: 'Timestamp Converter', path: '/timestamp-converter',
    description: 'Convert Unix timestamps to human-readable dates and vice-versa.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-file-code', title: 'Markdown Previewer', path: '/markdown-previewer',
    description: 'Write Markdown code and preview it rendered instantly.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-magnifying-glass', title: 'Regex Tester', path: '/regex-tester',
    description: 'Test, match, and debug regular expressions in real-time.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-palette', title: 'Gradient Generator', path: '/gradient-generator',
    description: 'Create linear or radial CSS gradients with visual previews.',
    color: '#0ea5e9'
  },
  {
    icon: 'fa-solid fa-layer-group', title: 'Box Shadow Generator', path: '/box-shadow-generator',
    description: 'Build multi-layer CSS box shadows with a live visual preview.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-clock', title: 'Pomodoro Timer', path: '/pomodoro-timer',
    description: 'Stay focused with timed work sessions and break reminders.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-money-bill-transfer', title: 'Currency Converter', path: '/currency-converter',
    description: 'Convert between 35+ world currencies. Works offline.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-fingerprint', title: 'UUID Generator', path: '/uuid-generator',
    description: 'Generate bulk UUID v4 identifiers using native browser crypto.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-shield-halved', title: 'Password Strength Tester', path: '/password-strength-tester',
    description: 'Analyze password entropy, strength, and estimated crack time.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-tower-broadcast', title: 'Morse Code Translator', path: '/morse-code-translator',
    description: 'Encode and decode Morse code with audio signal playback.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-expand', title: 'Aspect Ratio Calculator', path: '/aspect-ratio-calculator',
    description: 'Find ratios, scale dimensions, and explore platform presets.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-font', title: 'ASCII Art Generator', path: '/ascii-art-generator',
    description: 'Convert text to large ASCII art banners with multiple styles.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-camera', title: 'QR Code Scanner', path: '/qr-code-scanner',
    description: 'Scan QR codes using your device webcam or camera.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-circle-half-stroke', title: 'Contrast Checker', path: '/contrast-checker',
    description: 'Check contrast ratios between foreground and background colors.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-palette', title: 'Color Palette Generator', path: '/color-palette-generator',
    description: 'Generate harmonious color schemes using color theory rules.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-wand-magic-sparkles', title: 'Text Cleaner', path: '/text-cleaner',
    description: 'Clean formatting, remove duplicate lines, sort, or encode text.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-hourglass-half', title: 'Countdown Timer', path: '/countdown-timer',
    description: 'Set a custom live countdown timer for your upcoming events.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-hashtag', title: 'Hash Generator', path: '/hash-generator',
    description: 'Generate SHA-256, SHA-512, MD5, and SHA-1 hashes locally.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-palette', title: 'Palette Extractor', path: '/color-palette-extractor',
    description: 'Extract dominant color palettes from any uploaded image.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-camera-retro', title: 'EXIF Viewer', path: '/exif-metadata-viewer',
    description: 'View JPEG metadata EXIF tags and strip details for privacy.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-file-export', title: 'SVG to PNG', path: '/svg-png-converter',
    description: 'Convert SVG vector graphics to PNG raster images client-side.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-scale-balanced', title: 'Unit Price Calculator', path: '/unit-price-calculator',
    description: 'Compare value for money of two products by volume or weight.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-calculator', title: 'Base Converter', path: '/number-base-converter',
    description: 'Convert numbers between binary, octal, decimal, and hex.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-code-compare', title: 'Diff Checker', path: '/diff-checker',
    description: 'Compare two text versions side-by-side or inline to spot changes.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-code', title: 'JSON to YAML', path: '/json-yaml-converter',
    description: 'Convert structured JSON data to human-friendly YAML and back.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-dice', title: 'Decision Maker', path: '/decision-maker',
    description: 'Roll dice, flip coins, or spin wheels for random choices.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-compass', title: 'Compass', path: '/compass',
    description: 'Real-time orientation compass dial using browser direction sensors.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-gauge', title: 'Speedometer', path: '/speedometer',
    description: 'Track real-time travel speed and coordinates using browser GPS sensors.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-microphone', title: 'Voice Recorder', path: '/voice-recorder',
    description: 'Record sound clips locally and display live waveform canvas frequencies.',
    color: '#ef4444'
  },
  {
    icon: 'fa-solid fa-drum', title: 'BPM & Metronome', path: '/bpm-metronome',
    description: 'Tap rhythms to measure beat BPM, or run an audio click metronome track.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-face-laugh-squint', title: 'Meme Generator', path: '/meme-generator',
    description: 'Upload templates and add custom top/bottom text captions on images.',
    color: '#f59e0b'
  },
  {
    icon: 'fa-solid fa-shapes', title: 'Glassmorphism Generator', path: '/glassmorphism-generator',
    description: 'Design modern CSS glass styling with interactive sliders and codes.',
    color: '#0ea5e9'
  },
  {
    icon: 'fa-solid fa-volume-high', title: 'Text to Speech Reader', path: '/text-to-speech',
    description: 'Convert typed or pasted text to spoken speech audio in real-time.',
    color: '#3b82f6'
  },
  {
    icon: 'fa-solid fa-file-csv', title: 'CSV ↔ JSON Converter', path: '/csv-json-converter',
    description: 'Convert spreadsheet CSV columns to structured JSON object lists and back.',
    color: '#10b981'
  },
  {
    icon: 'fa-solid fa-paintbrush', title: 'Sketchpad Board', path: '/sketchpad',
    description: 'Whiteboard drawing canvas with brushes, sizes, and transparent PNG saves.',
    color: '#d946ef'
  },
  {
    icon: 'fa-solid fa-stopwatch', title: 'Stopwatch Timer', path: '/stopwatch',
    description: 'High-precision lap and split timing records down to centiseconds.',
    color: '#ef4444'
  },
];

export default function Home() {
  return (
    <>
      <SEOHead
        title={null}
        description="Free online tools: QR code generator, password generator, unit converter, color picker, BMI calculator, loan calculator, and more. No signup required."
      />

      <section className="hero">
        <div className="hero-badge">✨ 100% Free — No Sign-up Required</div>
        <h1>Your All-in-One Online Toolbox</h1>
        <p>Fast, free, and private. All tools run in your browser — nothing is uploaded to any server.</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">52+</div>
            <div className="hero-stat-label">Free Tools</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">0</div>
            <div className="hero-stat-label">Data Collected</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">∞</div>
            <div className="hero-stat-label">Uses Per Day</div>
          </div>
        </div>
      </section>

      <AdBanner type="header" />

      <section>
        <div className="tools-grid">
          {tools.map((tool, i) => (
            <ToolCard key={tool.path} {...tool} />
          ))}
        </div>
      </section>

      <AdBanner type="footer" />
    </>
  );
}
