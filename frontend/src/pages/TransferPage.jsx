import { useState } from 'react';

import VoiceRecorder from '../components/VoiceRecorder';

function TransferPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  return (
    <div>
      <h1>Transfer Voice</h1>

      <div className="transfer-card">
        <div className="toggle-section">
          <label className="switch">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={() =>
                setVoiceEnabled(!voiceEnabled)
              }
            />

            <span className="slider"></span>
          </label>

          <p>Enable Voice Transfer</p>
        </div>

        {/* MANUAL INPUT */}
        <div className="manual-transfer">
          <input
            type="text"
            placeholder="Recipient"
          />

          <input
            type="number"
            placeholder="Amount"
          />
        </div>

        {/* VOICE MODE */}
        {voiceEnabled && <VoiceRecorder />}

        <button className="submit-transfer">
          Transfer
        </button>
      </div>
    </div>
  );
}

export default TransferPage;