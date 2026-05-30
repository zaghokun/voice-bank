import api from './api';

export async function sendVoiceCommand(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');

  const res = await api.post('/voice-input', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
