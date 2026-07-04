import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExifReader from 'exifreader';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

function parseGPS(gpsTag, refTag) {
  if (!gpsTag) return null;
  
  const val = parseFloat(gpsTag.description);
  if (!isNaN(val) && gpsTag.description.indexOf('deg') === -1) {
    let dec = val;
    if (refTag && (refTag.description === 'S' || refTag.description === 'W')) {
      dec = -dec;
    }
    return dec;
  }
  
  const matches = gpsTag.description.match(/([0-9.]+)/g);
  if (matches && matches.length >= 3) {
    const d = parseFloat(matches[0]);
    const m = parseFloat(matches[1]);
    const s = parseFloat(matches[2]);
    let dec = d + (m / 60) + (s / 3600);
    
    const ref = refTag ? refTag.description : '';
    if (ref === 'S' || ref === 'W' || gpsTag.description.includes('S') || gpsTag.description.includes('W')) {
      dec = -dec;
    }
    return dec;
  }
  
  return null;
}

export default function ExifMetadataViewer() {
  const [imageSrc, setImageSrc] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [gpsData, setGpsData] = useState(null);

  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setImageFile(file);
    setLoading(true);
    setGpsData(null);

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

      // Parse GPS
      const lat = parseGPS(tags.GPSLatitude, tags.GPSLatitudeRef);
      const lon = parseGPS(tags.GPSLongitude, tags.GPSLongitudeRef);
      if (lat !== null && lon !== null) {
        setGpsData({ lat: lat.toFixed(6), lon: lon.toFixed(6) });
      }
    } catch (err) {
      setMetadata({ error: 'No EXIF metadata found or unsupported file format.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
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

      // Export canvas strips EXIF automatically
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
      <SEOHead title="EXIF Metadata Viewer & Stripper" description="Upload images to view metadata (EXIF/GPS) and inspect coordinates on a map. Strip metadata for privacy protection." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>EXIF Viewer</span></div>
        <h1><i className="fa-solid fa-camera-retro" style={{ color: 'var(--accent-purple-light)' }}></i> EXIF Metadata Viewer & Stripper</h1>
        <p>Analyze photo details, explore GPS shoot coordinates on maps, and strip metadata to protect privacy.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card">
            
            {/* Drag and drop zone */}
            <div 
              className="drop-zone"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]); }}
              style={{
                border: isDragging ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)',
                background: isDragging ? 'var(--bg-glass-hover)' : 'none',
                transition: 'all 0.2s',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '1.25rem'
              }}
            >
              <div className="drop-zone-icon" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--accent-purple-light)' }}>
                <i className="fa-solid fa-images"></i>
              </div>
              <h3>{isDragging ? 'Drop photo here!' : 'Select or drag an image'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Compatible with JPG, PNG, WebP format photos</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            {loading && <p style={{ color: 'var(--accent-cyan-light)', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> Reading metadata tags...</p>}

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', maxHeight: '380px', overflowY: 'auto' }}>
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

            {/* GPS coordinates map section */}
            {gpsData && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--accent-cyan-light)' }}></i>
                  Image Capture Location
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <a className="btn btn-secondary btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${gpsData.lat},${gpsData.lon}`} target="_blank" rel="noopener noreferrer" style={{ gap: '6px' }}>
                    <i className="fa-brands fa-google"></i> Google Maps
                  </a>
                  <a className="btn btn-secondary btn-sm" href={`https://maps.apple.com/?q=${gpsData.lat},${gpsData.lon}`} target="_blank" rel="noopener noreferrer" style={{ gap: '6px' }}>
                    <i className="fa-solid fa-map"></i> Apple Maps
                  </a>
                  <a className="btn btn-secondary btn-sm" href={`https://www.openstreetmap.org/?mlat=${gpsData.lat}&mlon=${gpsData.lon}#map=16/${gpsData.lat}/${gpsData.lon}`} target="_blank" rel="noopener noreferrer" style={{ gap: '6px' }}>
                    <i className="fa-solid fa-road"></i> OpenStreetMap
                  </a>
                </div>

                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)', background: 'var(--bg-input)', width: '100%', height: '300px' }}>
                  <iframe 
                    title="GPS Location Map"
                    src={`https://maps.google.com/maps?q=${gpsData.lat},${gpsData.lon}&z=15&output=embed`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="EXIF Metadata Viewer — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
