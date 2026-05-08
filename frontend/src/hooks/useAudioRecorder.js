import { useState } from 'react';

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      let chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: 'audio/wav',
        });

        const url = URL.createObjectURL(blob);

        setAudioURL(url);
      };

      recorder.start();

      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  return {
    recording,
    audioURL,
    startRecording,
    stopRecording,
  };
}