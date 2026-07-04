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

    // Inject Schema.org JSON-LD
    const scriptId = 'schema-json-ld';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schema = title ? {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": `${title} — ToolBox Hub`,
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5/JavaScript",
      "description": description
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ToolBox Hub",
      "url": window.location.origin,
      "description": description
    };

    script.textContent = JSON.stringify(schema);

    return () => {
      const oldScript = document.getElementById(scriptId);
      if (oldScript) {
        oldScript.remove();
      }
    };
  }, [title, description]);

  return null;
}
