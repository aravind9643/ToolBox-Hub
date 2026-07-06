import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdBanner from '../components/AdBanner';
import ShareButtons from '../components/ShareButtons';

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [duration, setDuration] = useState(0);
  
  // Custom Playback controls
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playbackVolume, setPlaybackVolume] = useState(1.0);
  const [visualMode, setVisualMode] = useState('bars'); // 'bars' | 'wave'

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMsg('');
    setAudioUrl('');
    setRecordedBlob(null);
    audioChunksRef.current = [];

    const hasMediaDevices = !!(navigator.mediaDevices);
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasMediaRecorder = !!(window.MediaRecorder);

    if (!hasMediaDevices || !hasGetUserMedia || !hasMediaRecorder) {
      const msg = 'Recording is not supported in this browser. Ensure localhost/HTTPS connection.';
      setErrorMsg(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(err => console.warn('Failed to resume AudioContext:', err));
        }
        
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        analyserRef.current = analyser;
        audioCtxRef.current = audioContext;
        drawWaveform();
      } catch (audioErr) {
        console.warn('Audio visualizer failed to initialize:', audioErr);
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        // Reset playback states
        setPlaybackSpeed(1.0);
        setPlaybackVolume(1.0);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('permission')) {
        setErrorMsg('Microphone access is blocked or denied. Please enable mic access in your browser settings.');
      } else {
        setErrorMsg('Microphone access failed: ' + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setRecording(false);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      animationFrameRef.current = requestAnimationFrame(draw);

      if (visualMode === 'bars') {
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(0, 0, w, h);

        const barWidth = (w / bufferLength) * 2.0;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * h * 0.85;
          const pct = i / bufferLength;
          ctx.fillStyle = `hsl(${200 + pct * 60}, 90%, 65%)`;
          ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        // Sine wave visualizer mode
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#60a5fa';
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
    };

    draw();
  };

  useEffect(() => {
    if (recording) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      drawWaveform();
    }
  }, [visualMode]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const downloadRecording = () => {
    if (!audioUrl || !recordedBlob) return;
    const extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice_recording.${extension}`;
    link.click();
  };

  const handleSpeedChange = (val) => {
    setPlaybackSpeed(val);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = val;
    }
  };

  const handleVolumeChange = (val) => {
    setPlaybackVolume(val);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = val;
    }
  };

  return (
    <div className="tool-page">
      <SEOHead title="Microphone Voice Recorder & Player" description="Record high-quality vocal clips. Displays live waveform visualizations and offers custom speed playbacks." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Voice Recorder</span></div>
        <h1><i className="fa-solid fa-microphone" style={{ color: 'var(--accent-purple-light)' }}></i> Voice Recorder</h1>
        <p>Record notes directly, analyze wave visualizers, and adjust playback speed controls.</p>
      </div>

      <AdBanner type="header" />

      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-main">
          <div className="glass-card" style={{ textAlign: 'center' }}>
            {errorMsg && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', width: '100%' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                {errorMsg}
              </div>
            )}

            {/* Visualizer Mode Switch */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                className={`btn btn-sm ${visualMode === 'bars' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setVisualMode('bars')}
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              >
                Frequency Bars
              </button>
              <button 
                className={`btn btn-sm ${visualMode === 'wave' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setVisualMode('wave')}
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              >
                Oscilloscope Wave
              </button>
            </div>

            <div className="waves-visualizer" style={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden', height: '140px', marginBottom: '1.5rem' }}>
              <canvas ref={canvasRef} width="400" height="140" style={{ width: '100%', height: '100%', display: 'block' }} />
              {recording && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.45)',
                  borderRadius: '6px', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center',
                  gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block', animation: 'rec-pulse 1s infinite' }} />
                  REC {formatDuration(duration)}
                </div>
              )}
              {!recording && !audioUrl && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Click Start Recording to capture voice audio...
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {!recording ? (
                <button className="btn btn-primary" onClick={startRecording} style={{ gap: '8px' }}>
                  <i className="fa-solid fa-microphone"></i> Start Recording
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={stopRecording} style={{ gap: '8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <i className="fa-solid fa-stop"></i> Stop Recording
                </button>
              )}
              {audioUrl && (
                <>
                  <button className="btn btn-secondary" onClick={downloadRecording} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-download"></i> Download Clip
                  </button>
                  <button className="btn btn-secondary" onClick={() => setAudioUrl('')} style={{ gap: '8px', color: 'var(--accent-red)' }}>
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </>
              )}
            </div>

            {/* Custom Audio Player with Speed and Volume modifiers */}
            {audioUrl && (
              <div style={{ width: '100%', background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <audio ref={audioPlayerRef} src={audioUrl} controls style={{ width: '100%', maxWidth: '420px' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '420px', fontSize: '0.8rem', textAlign: 'left' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <label style={{ color: 'var(--text-secondary)' }}>Playback Speed</label>
                      <span style={{ fontWeight: 700 }}>{playbackSpeed.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1" 
                      value={playbackSpeed} 
                      onChange={e => handleSpeedChange(Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <label style={{ color: 'var(--text-secondary)' }}>Volume Booster</label>
                      <span style={{ fontWeight: 700 }}>{Math.round(playbackVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1.0" 
                      step="0.05" 
                      value={playbackVolume} 
                      onChange={e => handleVolumeChange(Number(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="glass-card mt-2">
            <h3>Share this tool</h3>
            <ShareButtons title="Voice Recorder — ToolBox Hub" />
          </div>
        </div>
      </div>

      <AdBanner type="footer" />
    </div>
  );
}
