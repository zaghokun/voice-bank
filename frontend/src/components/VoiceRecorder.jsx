import { useAudioRecorder } from '../hooks/useAudioRecorder';

function VoiceRecorder() {
  const {
    recording,
    audioURL,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  return (
    <div className="voice-box">
      <h3>Voice Transfer</h3>

      {!recording ? (
        <button
          className="voice-btn"
          onClick={startRecording}
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          className="stop-btn"
          onClick={stopRecording}
        >
          ⏹ Stop Recording
        </button>
      )}

      {audioURL && (
        <div className="audio-preview">
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;