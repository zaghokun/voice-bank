import { useState, useRef } from 'react';

/**
 * Audio recorder hook yang output WAV PCM16 mono 16kHz.
 *
 * Browser MediaRecorder default = WebM/Opus, tapi backend butuh WAV.
 * Hook ini decode WebM ke AudioBuffer pakai Web Audio API,
 * lalu encode ulang ke WAV PCM16 16kHz mono.
 *
 * Hasil: audioBlob siap dikirim ke /api/voice-input tanpa butuh ffmpeg di server.
 */

const TARGET_SR = 16000;

// AudioBuffer → WAV blob (PCM16 mono)
function audioBufferToWav(audioBuffer) {
  const numChannels = 1; // mono
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF header
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Resample AudioBuffer ke target sample rate menggunakan OfflineAudioContext
async function resampleAudio(audioBuffer, targetSR) {
  if (audioBuffer.sampleRate === targetSR && audioBuffer.numberOfChannels === 1) {
    return audioBuffer;
  }

  const offline = new OfflineAudioContext(
    1, // mono
    Math.ceil(audioBuffer.duration * targetSR),
    targetSR
  );
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start(0);
  return await offline.startRendering();
}

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1 },
      });
      streamRef.current = stream;

      // Pakai mime yang didukung browser (biasanya audio/webm)
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : '';
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          // 1. Gabungkan chunks jadi 1 blob (WebM/Opus)
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType });

          // 2. Decode WebM → AudioBuffer pakai Web Audio API
          const arrayBuffer = await rawBlob.arrayBuffer();
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const decoded = await ctx.decodeAudioData(arrayBuffer);

          // 3. Resample ke 16kHz mono
          const resampled = await resampleAudio(decoded, TARGET_SR);

          // 4. Encode ke WAV PCM16
          const wavBlob = audioBufferToWav(resampled);

          setAudioBlob(wavBlob);
          setAudioURL(URL.createObjectURL(wavBlob));

          ctx.close();
        } catch (err) {
          console.error('Gagal convert audio ke WAV:', err);
          // Fallback: kirim raw blob
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType });
          setAudioBlob(rawBlob);
          setAudioURL(URL.createObjectURL(rawBlob));
        } finally {
          // Stop track
          streamRef.current?.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error('Gagal merekam audio:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return { recording, audioBlob, audioURL, startRecording, stopRecording };
}
