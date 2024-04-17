import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose, onSave, onClearHistory }) => {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('claude-3-haiku-20240307');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSave = () => {
    onSave(apiKey, modelName);
    localStorage.setItem('apiKey', apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Settings</h2>
        <div className="modal-body">
          <div className="input-group">
            <label>API Key:</label>
            <input
              type="password"
              value={apiKey.replace(/./g, '*')}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Model Name:</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="select-field"
            >
              <option value="">Select a model</option>
              <option value="claude-3-haiku-20240307">Claude Haiku</option>
              <option value="claude-3-opus-20240229">Claude Opus</option>
              {/* Add more model options as needed */}
            </select>
          </div>

        </div>
        <div className="modal-footer ">
          
          <button onClick={onClearHistory} className="clear-history-button">
            Clear History
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
    
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;