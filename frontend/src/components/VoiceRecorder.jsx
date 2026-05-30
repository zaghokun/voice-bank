import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { sendVoiceCommand } from '../services/voiceService';
import { tts } from '../services/ttsService';

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function VoiceRecorder({ onResult }) {
  const { recording, audioBlob, audioURL, startRecording, stopRecording } = useAudioRecorder();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = useCallback(() => {
    vibrate(100);
    tts.recordingStart();
    startRecording();
  }, [startRecording]);

  const handleStop = useCallback(() => {
    vibrate([50, 50, 50]);
    stopRecording();
    tts.recordingStop();
  }, [stopRecording]);

  // Keyboard shortcut: Space to start/stop recording
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (recording) {
          handleStop();
        } else {
          handleStart();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recording, handleStart, handleStop]);

  const handleSend = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError('');

    try {
      const data = await sendVoiceCommand(audioBlob);
      setResult(data);
      tts.intentDetected(data.intent, data.confidence);
      if (onResult) onResult(data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Gagal memproses perintah suara';
      setError(msg);
      tts.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voice-box" role="region" aria-label="Perekam perintah suara">
      <h3>Voice Command</h3>

      {!recording ? (
        <button className="voice-btn" onClick={handleStart} aria-label="Mulai merekam perintah suara">
          🎤 Start Recording
        </button>
      ) : (
        <button className="stop-btn" onClick={handleStop} aria-label="Berhenti merekam">
          ⏹ Stop Recording
        </button>
      )}

      {audioURL && (
        <div className="audio-preview">
          <audio controls src={audioURL} aria-label="Preview rekaman suara"></audio>
          <button className="send-btn" onClick={handleSend} disabled={loading} aria-label={loading ? 'Sedang memproses perintah' : 'Kirim perintah suara'}>
            {loading ? 'Memproses...' : '📤 Kirim Perintah'}
          </button>
        </div>
      )}

      <div aria-live="assertive">
        {error && <p className="error-msg">{error}</p>}
      </div>

      {result && (
        <div className="voice-result" aria-live="polite" aria-label={`Perintah terdeteksi: ${result.intent}, keyakinan ${(result.confidence * 100).toFixed(1)} persen`}>
          <p><strong>Intent:</strong> {result.intent}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;