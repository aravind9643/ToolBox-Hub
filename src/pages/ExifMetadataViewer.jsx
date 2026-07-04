import { useState } from 'react';
import { Link } from 'react-router-dom';
import ExifReader from 'exifreader';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function ExifMetadataViewer() {
  const [imageSrc, setImageSrc] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setLoading(true);

    // Read image preview
    const reader = new FileReader();
    reader.onload = (event) => setImageSrc(event.target.result);
    reader.readAsDataURL(file);

    try {
      // Load EXIF
      const tags = await ExifReader.load(file);
      const parsed = {};
      Object.keys(tags).forEach(tag => {
        parsed[tag] = tags[tag].description;
      });
      setMetadata(parsed);
    } catch {
      setMetadata({ error: 'No EXIF metadata found or unsupported file format.' });
    } finally {
      setLoading(false);
    }
  };

  const stripMetadata = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Canvas export strips all EXIF metadata natively!
      const link = document.createElement('a');
      link.download = imageFile ? `clean_${imageFile.name}` : 'clean_image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imageSrc;
  };

  const importantTags = [
    { key: 'Make', label: 'Camera Manufacturer' },
    { key: 'Model', label: 'Camera Model' },
    { key: 'DateTime', label: 'Date/Time Taken' },
    { key: 'ExposureTime', label: 'Exposure Time' },
    { key: 'FNumber', label: 'Aperture (F-Stop)' },
    { key: 'ISOSpeedRatings', label: 'ISO Speed' },
    { key: 'FocalLength', label: 'Focal Length' },
    { key: 'GPSLatitude', label: 'GPS Latitude' },
    { key: 'GPSLongitude', label: 'GPS Longitude' },
    { key: 'Software', label: 'Editing Software' }
  ];

  return (
    <div className="tool-page">
      <SEOHead title="EXIF Metadata Viewer & Stripper" description="Upload images to view metadata (EXIF/GPS). Strip metadata for privacy protection before sharing." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>EXIF Viewer</span></div>
        <h1><i className="fa-solid fa-camera-retro" style={{ color: 'var(--accent-purple-light)' }}></i> EXIF Metadata Viewer & Stripper</h1>
        <p>View image EXIF tags (camera, dates, locations) and download a metadata-free sanitized copy.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            <div className="form-group">
              <label className="form-label">Upload Image (JPG, PNG, WebP)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" style={{ padding: '0.5rem' }} />
            </div>

            {loading && <p style={{ color: 'var(--accent-cyan-light)' }}>Reading metadata tags...</p>}

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset', marginTop: '1rem' }}>
              {/* Preview */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                {imageSrc ? (
                  <>
                    <img src={imageSrc} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '2px solid var(--border-color)', objectFit: 'contain' }} />
                    <button className="btn btn-primary" onClick={stripMetadata} style={{ gap: '8px', width: '100%', justifyContent: 'center' }}>
                      <i className="fa-solid fa-shield-halved"></i> Download Clean Copy (No EXIF)
                    </button>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '220px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Image preview will appear here
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="workspace-column">
                <h3>EXIF Details</h3>
                {metadata ? (
                  metadata.error ? (
                    <div style={{ padding: '1rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-amber)', marginRight: '6px' }}></i>
                      {metadata.error}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {importantTags.map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{metadata[key] || '—'}</span>
                        </div>
                      ))}
                      <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.25rem 0' }}>Show all parsed tags</summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {Object.keys(metadata).map(tag => (
                            <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.02)', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{tag}</span>
                              <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{metadata[tag]}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                    Select an image to read details and coordinates.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="EXIF Metadata Viewer & Stripper — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
