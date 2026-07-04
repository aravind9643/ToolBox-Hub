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

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const durationIntervalRef = useRef(null);

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

      // Web Audio setup for live visualizer (isolated try-catch so it never blocks recording)
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
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('permission')) {
        setErrorMsg('Microphone access is blocked or denied. Please click the lock/settings icon next to the URL in your browser address bar to allow microphone permissions.');
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

  useEffect(() => {
    // Check initial support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setErrorMsg('Recording is not supported on this browser or connection. Please use a modern browser (Chrome, Firefox, Safari) and ensure you are on a secure context (localhost or HTTPS).');
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

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

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.fillRect(0, 0, w, h);

      const barWidth = (w / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.8;

        const red = (i * 2) % 255;
        const green = 165;
        const blue = 250;

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  useEffect(() => {
    return () => {
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

  return (
    <div className="tool-page">
      <SEOHead title="Microphone Voice Recorder" description="Record sound from your microphone. Displays live canvas waveform visualization and saves files client-side." />
      <div className="tool-page-header">
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Voice Recorder</span></div>
        <h1><i className="fa-solid fa-microphone" style={{ color: 'var(--accent-purple-light)' }}></i> Microphone Voice Recorder</h1>
        <p>Record notes and audio clips directly from your browser with real-time waveform visualizers.</p>
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

            <div className="waves-visualizer">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes rec-pulse {
                  0% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(1.15); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .rec-indicator {
                  animation: rec-pulse 1.2s infinite ease-in-out;
                }
              `}} />
              <canvas ref={canvasRef} width="400" height="140" style={{ width: '100%', height: '100%', display: 'block' }} />
              {recording && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '6px', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center',
                  gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)'
                }}>
                  <span className="rec-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block' }} />
                  REC {formatDuration(duration)}
                </div>
              )}
              {!recording && !audioUrl && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Click Start Recording to begin
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
                  <i className="fa-solid fa-square"></i> Stop Recording
                </button>
              )}
              {audioUrl && (
                <>
                  <button className="btn btn-secondary" onClick={downloadRecording} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-download"></i> Download Clip
                  </button>
                  <button className="btn btn-secondary" onClick={() => setAudioUrl('')} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </>
              )}
            </div>

            {audioUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1rem' }}>
                <audio src={audioUrl} controls style={{ width: '100%', maxWidth: '400px' }} />
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
