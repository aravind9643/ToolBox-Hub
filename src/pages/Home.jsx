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
            <div className="hero-stat-value">16+</div>
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
