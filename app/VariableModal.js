import React, { useState, useEffect } from 'react';


const VariableModal = ({ isOpen, onClose, onSave, initialName = '', initialContent = '' }) => {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setName(initialName);
    setContent(initialContent);
  }, [initialName, initialContent]);

  const handleSave = () => {
    onSave(name, content);
    onClose();

    setName('');
    setContent('');

  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <h2>{initialName ? 'Edit Variable' : 'Add Variable'}</h2>
        <div className="modal-body">
          <div className="input-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field"
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
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

export default VariableModal;