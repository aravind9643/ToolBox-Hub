import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>ToolBox Hub</h3>
          <p>Free online tools for everyone. No sign-up required. Fast, secure, and works offline. All processing happens in your browser.</p>
        </div>
        <div className="footer-col">
          <h4>Generators</h4>
          <Link to="/qr-code-generator">QR Code Generator</Link>
          <Link to="/password-generator">Password Generator</Link>
          <Link to="/lorem-ipsum">Lorem Ipsum</Link>
        </div>
        <div className="footer-col">
          <h4>Calculators</h4>
          <Link to="/bmi-calculator">BMI Calculator</Link>
          <Link to="/age-calculator">Age Calculator</Link>
          <Link to="/loan-calculator">Loan Calculator</Link>
        </div>
        <div className="footer-col">
          <h4>Converters</h4>
          <Link to="/unit-converter">Unit Converter</Link>
          <Link to="/color-picker">Color Picker</Link>
          <Link to="/base64-converter">Base64 Converter</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} ToolBox Hub. All rights reserved.</span>
        <span>Made with 💜 for everyone</span>
      </div>
    </footer>
  );
}
