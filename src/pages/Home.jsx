import ToolCard from '../components/ToolCard';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

const tools = [
  {
    icon: '📱', title: 'QR Code Generator', path: '/qr-code-generator',
    description: 'Generate QR codes for URLs, text, WiFi credentials, and more.',
    color: '#7c3aed'
  },
  {
    icon: '🔐', title: 'Password Generator', path: '/password-generator',
    description: 'Create strong, secure passwords with customizable options.',
    color: '#ec4899'
  },
  {
    icon: '📏', title: 'Unit Converter', path: '/unit-converter',
    description: 'Convert between units of length, weight, temperature, and more.',
    color: '#06b6d4'
  },
  {
    icon: '🎨', title: 'Color Picker', path: '/color-picker',
    description: 'Pick colors and convert between HEX, RGB, and HSL formats.',
    color: '#f59e0b'
  },
  {
    icon: '⚖️', title: 'BMI Calculator', path: '/bmi-calculator',
    description: 'Calculate your Body Mass Index and get health insights.',
    color: '#10b981'
  },
  {
    icon: '🎂', title: 'Age Calculator', path: '/age-calculator',
    description: 'Calculate your exact age in years, months, and days.',
    color: '#8b5cf6'
  },
  {
    icon: '💰', title: 'Loan Calculator', path: '/loan-calculator',
    description: 'Calculate EMI, total interest, and amortization schedules.',
    color: '#14b8a6'
  },
  {
    icon: '📝', title: 'Word Counter', path: '/word-counter',
    description: 'Count words, characters, sentences, and reading time.',
    color: '#f97316'
  },
  {
    icon: '{ }', title: 'JSON Formatter', path: '/json-formatter',
    description: 'Format, validate, and beautify JSON data instantly.',
    color: '#22d3ee'
  },
  {
    icon: '🖼️', title: 'Image Compressor', path: '/image-compressor',
    description: 'Compress images in your browser. No upload to any server.',
    color: '#a855f7'
  },
  {
    icon: '🔄', title: 'Base64 Converter', path: '/base64-converter',
    description: 'Encode and decode text or files to/from Base64 format.',
    color: '#e11d48'
  },
  {
    icon: '📄', title: 'Lorem Ipsum Generator', path: '/lorem-ipsum',
    description: 'Generate placeholder text for your designs and mockups.',
    color: '#0ea5e9'
  },
  {
    icon: '⏰', title: 'Timestamp Converter', path: '/timestamp-converter',
    description: 'Convert Unix timestamps to human-readable dates and vice-versa.',
    color: '#10b981'
  },
  {
    icon: '✍️', title: 'Markdown Previewer', path: '/markdown-previewer',
    description: 'Write Markdown code and preview it rendered instantly.',
    color: '#ec4899'
  },
  {
    icon: '🔍', title: 'Regex Tester', path: '/regex-tester',
    description: 'Test, match, and debug regular expressions in real-time.',
    color: '#7c3aed'
  },
  {
    icon: '🌈', title: 'Gradient Generator', path: '/gradient-generator',
    description: 'Create linear or radial CSS gradients with visual previews.',
    color: '#06b6d4'
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
