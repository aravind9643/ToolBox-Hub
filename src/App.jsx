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
import TipCalculator from './pages/TipCalculator';
import DateCalculator from './pages/DateCalculator';
import TDEECalculator from './pages/TDEECalculator';
import CompoundInterestCalculator from './pages/CompoundInterestCalculator';
import WordCounter from './pages/WordCounter';
import JSONFormatter from './pages/JSONFormatter';
import ImageCompressor from './pages/ImageCompressor';
import Base64Converter from './pages/Base64Converter';
import LoremIpsumGenerator from './pages/LoremIpsumGenerator';
import TimestampConverter from './pages/TimestampConverter';
import MarkdownPreviewer from './pages/MarkdownPreviewer';
import RegexTester from './pages/RegexTester';
import GradientGenerator from './pages/GradientGenerator';
import BoxShadowGenerator from './pages/BoxShadowGenerator';
import PomodoroTimer from './pages/PomodoroTimer';
import CurrencyConverter from './pages/CurrencyConverter';
import UUIDGenerator from './pages/UUIDGenerator';
import PasswordStrengthTester from './pages/PasswordStrengthTester';
import MorseCodeTranslator from './pages/MorseCodeTranslator';
import AspectRatioCalculator from './pages/AspectRatioCalculator';
import AsciiArtGenerator from './pages/AsciiArtGenerator';
import QRCodeScanner from './pages/QRCodeScanner';
import ContrastChecker from './pages/ContrastChecker';
import ColorPaletteGenerator from './pages/ColorPaletteGenerator';
import TextCleaner from './pages/TextCleaner';
import CountdownTimer from './pages/CountdownTimer';
import ColorPaletteExtractor from './pages/ColorPaletteExtractor';
import ExifMetadataViewer from './pages/ExifMetadataViewer';
import SvgPngConverter from './pages/SvgPngConverter';
import HashGenerator from './pages/HashGenerator';
import DiffChecker from './pages/DiffChecker';
import JsonYamlConverter from './pages/JsonYamlConverter';
import DecisionMaker from './pages/DecisionMaker';
import UnitPriceCalculator from './pages/UnitPriceCalculator';
import NumberBaseConverter from './pages/NumberBaseConverter';

import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
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
          <Route path="/tip-calculator" element={<TipCalculator />} />
          <Route path="/date-calculator" element={<DateCalculator />} />
          <Route path="/tdee-calculator" element={<TDEECalculator />} />
          <Route path="/compound-interest-calculator" element={<CompoundInterestCalculator />} />
          <Route path="/word-counter" element={<WordCounter />} />
          <Route path="/json-formatter" element={<JSONFormatter />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/base64-converter" element={<Base64Converter />} />
          <Route path="/lorem-ipsum" element={<LoremIpsumGenerator />} />
          <Route path="/timestamp-converter" element={<TimestampConverter />} />
          <Route path="/markdown-previewer" element={<MarkdownPreviewer />} />
          <Route path="/regex-tester" element={<RegexTester />} />
          <Route path="/gradient-generator" element={<GradientGenerator />} />
          <Route path="/box-shadow-generator" element={<BoxShadowGenerator />} />
          <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
          <Route path="/currency-converter" element={<CurrencyConverter />} />
          <Route path="/uuid-generator" element={<UUIDGenerator />} />
          <Route path="/password-strength-tester" element={<PasswordStrengthTester />} />
          <Route path="/morse-code-translator" element={<MorseCodeTranslator />} />
          <Route path="/aspect-ratio-calculator" element={<AspectRatioCalculator />} />
          <Route path="/ascii-art-generator" element={<AsciiArtGenerator />} />
          <Route path="/qr-code-scanner" element={<QRCodeScanner />} />
          <Route path="/contrast-checker" element={<ContrastChecker />} />
          <Route path="/color-palette-generator" element={<ColorPaletteGenerator />} />
          <Route path="/text-cleaner" element={<TextCleaner />} />
          <Route path="/countdown-timer" element={<CountdownTimer />} />
          <Route path="/color-palette-extractor" element={<ColorPaletteExtractor />} />
          <Route path="/exif-metadata-viewer" element={<ExifMetadataViewer />} />
          <Route path="/svg-png-converter" element={<SvgPngConverter />} />
          <Route path="/hash-generator" element={<HashGenerator />} />
          <Route path="/diff-checker" element={<DiffChecker />} />
          <Route path="/json-yaml-converter" element={<JsonYamlConverter />} />
          <Route path="/decision-maker" element={<DecisionMaker />} />
          <Route path="/unit-price-calculator" element={<UnitPriceCalculator />} />
          <Route path="/number-base-converter" element={<NumberBaseConverter />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
