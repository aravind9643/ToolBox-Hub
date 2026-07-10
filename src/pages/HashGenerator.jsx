import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

// Clean JS MD5 implementation
function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }
  function AddUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x,y,z) { return (x & y) | ((~x) & z); }
  function G(x,y,z) { return (x & z) | (y & (~z)); }
  function H(x,y,z) { return (x ^ y ^ z); }
  function I(x,y,z) { return (y ^ (x | (~z))); }
  function FF(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b,c,d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b,c,d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b,c,d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b,c,d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray=Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount - (lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
    }
    return WordToHexValue;
  }
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  var x=Array();
  var k,S11,S12,S13,S14,S21,S22,S23,S24,S31,S32,S33,S34,S41,S42,S43,S44;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  var a=0x67452301; var b=0xEFCDAB89; var c=0x98BADCFE; var d=0x10325476;
  S11=7; S12=12; S13=17; S14=22; S21=5; S22=9; S23=14; S24=20; S31=4; S32=11; S33=16; S34=23; S41=6; S42=10; S43=15; S44=21;
  for (k=0;k<x.length;k+=16) {
    var AA=a; var BB=b; var CC=c; var DD=d;
    a=FF(a,b,c,d,x[k+0], S11,0xD76AA478); d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756); c=FF(c,d,a,b,x[k+2], S13,0x242070DB); b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF); d=FF(d,a,b,c,x[k+5], S12,0x4787C62A); c=FF(c,d,a,b,x[k+6], S13,0xA8304613); b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=FF(a,b,c,d,x[k+8], S11,0x698098D8); d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF); c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1); b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=FF(a,b,c,d,x[k+12],S11,0x6B901122); d=FF(d,a,b,c,x[k+13],S12,0xFD987193); c=FF(c,d,a,b,x[k+14],S13,0xA679438E); b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=GG(a,b,c,d,x[k+1], S21,0xF61E2562); d=GG(d,a,b,c,x[k+6], S22,0xC040B340); c=GG(c,d,a,b,x[k+11],S23,0x265E5A51); b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=GG(a,b,c,d,x[k+5], S21,0xD62F105D); d=GG(d,a,b,c,x[k+10],S22,0x2441453);  c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681); b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6); d=GG(d,a,b,c,x[k+14],S22,0xC33707D6); c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87); b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905); d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8); c=GG(c,d,a,b,x[k+7], S23,0x676F02D9); b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942); d=HH(d,a,b,c,x[k+8], S32,0x8771F681); c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122); b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44); d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9); c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60); b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6); d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA); c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085); b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039); d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5); c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8); b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=II(a,b,c,d,x[k+0], S41,0xF4292244); d=II(d,a,b,c,x[k+7], S42,0x432AFF97); c=II(c,d,a,b,x[k+14],S43,0xAB9423A7); b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=II(a,b,c,d,x[k+12],S41,0x655B59C3); d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92); c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D); b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F); d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0); c=II(c,d,a,b,x[k+6], S43,0xA3014314); b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=II(a,b,c,d,x[k+4], S41,0xF7537E82); d=II(d,a,b,c,x[k+11],S42,0xBD3AF235); c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB); b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=AddUnsigned(a,AA); b=AddUnsigned(b,BB); c=AddUnsigned(c,CC); d=AddUnsigned(d,DD);
  }
  var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
  return temp.toLowerCase();
}

async function shaHash(text, algorithm) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function HashGenerator() {
  const [inputText, setInputText] = useState('');
  const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '', sha512: '' });
  const [copied, setCopied] = useState('');
  
  // Custom modifiers
  const [salt, setSalt] = useState('');
  const [saltPosition, setSaltPosition] = useState('append'); // 'prepend' | 'append'
  const [dragActive, setDragActive] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);

  const finalInputText = useMemo(() => {
    if (!salt) return inputText;
    return saltPosition === 'prepend' ? salt + inputText : inputText + salt;
  }, [inputText, salt, saltPosition]);

  useEffect(() => {
    const generateHashes = async () => {
      if (!finalInputText) {
        setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
        return;
      }
      const valMd5 = md5(finalInputText);
      const valSha1 = await shaHash(finalInputText, 'SHA-1');
      const valSha256 = await shaHash(finalInputText, 'SHA-256');
      const valSha512 = await shaHash(finalInputText, 'SHA-512');
      setHashes({ md5: valMd5, sha1: valSha1, sha256: valSha256, sha512: valSha512 });
    };

    generateHashes();
  }, [finalInputText]);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1200);
  };

  const handleFileDrop = async (file) => {
    if (!file) return;
    setFileDetails({ name: file.name, size: file.size });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target.result;
      const hashBuffer1 = await crypto.subtle.digest('SHA-1', buffer);
      const hashBuffer256 = await crypto.subtle.digest('SHA-256', buffer);
      const hashBuffer512 = await crypto.subtle.digest('SHA-512', buffer);
      
      const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashes({
        md5: 'N/A (Calculated for strings)',
        sha1: toHex(hashBuffer1),
        sha256: toHex(hashBuffer256),
        sha512: toHex(hashBuffer512)
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const hashList = [
    { label: 'MD5', value: hashes.md5 },
    { label: 'SHA-1', value: hashes.sha1 },
    { label: 'SHA-256', value: hashes.sha256 },
    { label: 'SHA-512', value: hashes.sha512 }
  ];

  return (
    <div className="tool-page">
      <SEOHead title="Hash Generator & Checksum Tool" description="Generate SHA-256, SHA-512, MD5 hashes, or verify secure local file checksums completely client-side." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Hash Generator</span></div>
        <h1><i className="fa-solid fa-hashtag" style={{ color: 'var(--accent-purple-light)' }}></i> Cryptographic Hash Suite</h1>
        <p>Pre-salt input text strings, generate secure hashes, or calculate local file checksum values.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          
          <div className="glass-card">
            
            {/* Custom Salts Config */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Optional salt string..." 
                  value={salt} 
                  onChange={e => setSalt(e.target.value)}
                  style={{ height: '34px', fontSize: '0.82rem' }} 
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <select className="form-select" value={saltPosition} onChange={e => setSaltPosition(e.target.value)} style={{ padding: '0.35rem 0.5rem', height: '34px', fontSize: '0.8rem' }}>
                  <option value="append">Append Salt</option>
                  <option value="prepend">Prepend Salt</option>
                </select>
              </div>
            </div>

            <div className="markdown-workspace" style={{ height: 'auto', minHeight: 'unset' }}>
              {/* String Hasher Input */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>String Hasher Input</h3>
                <textarea 
                  className="form-textarea" 
                  rows="5" 
                  value={inputText} 
                  onChange={e => { setInputText(e.target.value); setFileDetails(null); }} 
                  placeholder="Type or paste text to hash..." 
                  style={{ fontSize: '0.82rem' }} 
                />
              </div>

              {/* File Drop zone */}
              <div className="workspace-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>File Checksum (Secure)</h3>
                <div 
                  className="drop-zone"
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.length > 0) handleFileDrop(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('hash-file-picker').click()}
                  style={{ 
                    border: dragActive ? '2px dashed var(--accent-cyan-light)' : '2px dashed var(--border-color)', 
                    background: dragActive ? 'var(--bg-glass-hover)' : 'none',
                    borderRadius: '8px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'
                  }}
                >
                  <i className="fa-solid fa-file-shield" style={{ color: 'var(--accent-purple-light)', fontSize: '1.25rem', marginBottom: '0.4rem' }}></i>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Drag file here to compute hash</div>
                  <input id="hash-file-picker" type="file" style={{ display: 'none' }} onChange={e => handleFileDrop(e.target.files[0])} />
                </div>
              </div>
            </div>

            {fileDetails && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem' }}>
                📄 Checksum for file: <strong>{fileDetails.name}</strong> ({(fileDetails.size / 1024).toFixed(1)} KB)
              </div>
            )}

            {/* Hashes output grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              {hashList.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 1.0rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => value && copy(value, label)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: '0.65rem', color: copied === label ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {copied === label ? '✓ Copied' : 'Click to copy'}
                    </span>
                  </div>
                  <code style={{ fontSize: '0.82rem', color: 'var(--accent-cyan-light)', fontFamily: 'monospace', wordBreak: 'break-all', display: 'block', marginTop: '0.2rem' }}>
                    {value || '—'}
                  </code>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
