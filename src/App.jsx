import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/ScrollToTop';
import { tools } from './data/tools';

import Home from './pages/Home';
const NotFound = lazy(() => import('./pages/NotFound'));

const modules = import.meta.glob('./pages/*.jsx');
const fileNames = {
  '/lorem-ipsum': 'LoremIpsumGenerator', '/json-formatter': 'JSONFormatter',
  '/json-yaml-converter': 'JsonYamlConverter', '/svg-png-converter': 'SvgPngConverter',
  '/bmi-calculator': 'BMICalculator', '/tdee-calculator': 'TDEECalculator',
  '/uuid-generator': 'UUIDGenerator',
  '/qr-code-generator': 'QRCodeGenerator', '/qr-code-scanner': 'QRCodeScanner',
  '/ascii-art-generator': 'AsciiArtGenerator', '/csv-json-converter': 'CsvJsonConverter',
  '/bpm-metronome': 'BpmMetronome', '/text-to-speech': 'TextToSpeech',
  '/json-to-typescript': 'JsonToTypescript', '/json-diff': 'JsonDiff',
  '/jsonpath-evaluator': 'JsonpathEvaluator', '/json-schema-generator': 'JsonSchemaGenerator',
  '/json-flattener': 'JsonFlattener',
  '/json-generator': 'JsonGenerator'
};

const routeComponents = Object.fromEntries(tools.map(tool => {
  const fallback = tool.path.slice(1).split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
  const name = fileNames[tool.path] || fallback;
  return [tool.path, lazy(modules[`./pages/${name}.jsx`])];
}));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {tools.map(tool => {
            const Component = routeComponents[tool.path];
            return <Route key={tool.path} path={tool.path} element={<Component />} />;
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
