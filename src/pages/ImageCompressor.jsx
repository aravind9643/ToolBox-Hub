import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import SEOHead from '../components/SEOHead';

export default function ImageCompressor() {
  const [original, setOriginal] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(0.6);
  const [maxSize, setMaxSize] = useState(1);
  const [dragover, setDragover] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const originalUrl = URL.createObjectURL(file);
    setOriginal({ file, url: originalUrl, size: file.size, name: file.name });
    setCompressed(null);
    setProgress(0);

    setIsCompressing(true);
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: maxSize,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality,
        onProgress: (p) => setProgress(p),
      });

      const compressedUrl = URL.createObjectURL(compressedFile);
      setCompressed({ file: compressedFile, url: compressedUrl, size: compressedFile.size });
    } catch (err) {
      console.error(err);
    }
    setIsCompressing(false);
  }, [quality, maxSize]);

  const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const savings = original && compressed
    ? ((1 - compressed.size / original.size) * 100).toFixed(1)
    : 0;

  const handleDownload = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.download = `compressed_${original.name}`;
    link.href = compressed.url;
    link.click();
  };

  return (
    <div className="tool-page">
      <SEOHead title="Image Compressor" description="Compress images in your browser. No upload to any server. Free and private." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Image Compressor</span></div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-file-image" style={{ color: 'var(--accent-purple-light)' }}></i> Image Compressor
        </h1>
        <p>Compress images right in your browser. Nothing is uploaded to any server.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout">
        <div className="tool-main">
          <div className="glass-card">
            <div className="grid-2 mb-2">
              <div className="form-group">
                <label className="form-label">Quality: {Math.round(quality * 100)}%</label>
                <input className="form-range" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Size: {maxSize} MB</label>
                <input className="form-range" type="range" min="0.1" max="10" step="0.1" value={maxSize} onChange={e => setMaxSize(parseFloat(e.target.value))} />
              </div>
            </div>

            <div
              className={`drop-zone ${dragover ? 'dragover' : ''}`}
              onClick={() => document.getElementById('img-input').click()}
              onDragOver={e => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={e => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <div className="drop-zone-icon">
                <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--accent-purple-light)' }}></i>
              </div>
              <h3>Drop your image here or click to browse</h3>
              <p>Supports JPEG, PNG, WebP, and more</p>
              <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>

            {isCompressing && (
              <div style={{ marginTop: '1rem' }}>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Compressing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {original && compressed && (
              <>
                <div className="result-box mt-2 text-center">
                  <div className="result-label">Size Reduction</div>
                  <div className="result-value" style={{ color: parseFloat(savings) > 50 ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>{savings}%</div>
                  <div className="result-sub">{formatSize(original.size)} → {formatSize(compressed.size)}</div>
                </div>

                <div className="image-compare mt-2">
                  <div className="image-compare-box">
                    <div className="image-compare-label">Original</div>
                    <img src={original.url} alt="Original" />
                    <div className="image-compare-size">{formatSize(original.size)}</div>
                  </div>
                  <div className="image-compare-box">
                    <div className="image-compare-label">Compressed</div>
                    <img src={compressed.url} alt="Compressed" />
                    <div className="image-compare-size">{formatSize(compressed.size)}</div>
                  </div>
                </div>

                <button className="btn btn-primary btn-lg w-full mt-2" onClick={handleDownload} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-download"></i> Download Compressed Image
                </button>
              </>
            )}
          </div>
        </div>
        <div className="tool-sidebar">
          <AdBanner type="sidebar" />
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
