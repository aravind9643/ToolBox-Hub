import { useEffect } from 'react';

export default function SEOHead({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} — ToolBox Hub` : 'ToolBox Hub — Free Online Tools';
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description || 'Free online tools: QR code generator, password generator, unit converter, color picker, BMI calculator, and more. No signup required.';
  }, [title, description]);

  return null;
}
