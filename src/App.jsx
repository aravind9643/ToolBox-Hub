import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import QRCodeGenerator from './pages/QRCodeGenerator';
import PasswordGenerator from './pages/PasswordGenerator';
import UnitConverter from './pages/UnitConverter';
import ColorPicker from './pages/ColorPicker';
import BMICalculator from './pages/BMICalculator';
import AgeCalculator from './pages/AgeCalculator';
import LoanCalculator from './pages/LoanCalculator';
import WordCounter from './pages/WordCounter';
import JSONFormatter from './pages/JSONFormatter';
import ImageCompressor from './pages/ImageCompressor';
import Base64Converter from './pages/Base64Converter';
import LoremIpsumGenerator from './pages/LoremIpsumGenerator';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/qr-code-generator" element={<QRCodeGenerator />} />
          <Route path="/password-generator" element={<PasswordGenerator />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="/bmi-calculator" element={<BMICalculator />} />
          <Route path="/age-calculator" element={<AgeCalculator />} />
          <Route path="/loan-calculator" element={<LoanCalculator />} />
          <Route path="/word-counter" element={<WordCounter />} />
          <Route path="/json-formatter" element={<JSONFormatter />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/base64-converter" element={<Base64Converter />} />
          <Route path="/lorem-ipsum" element={<LoremIpsumGenerator />} />
        </Route>
      </Routes>
    </Router>
  );
}
