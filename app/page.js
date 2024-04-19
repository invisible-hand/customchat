'use client';

import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import VariableModal from './VariableModal';

const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [variables, setVariables] = useState([]);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);

  const introChat = {
    name: 'Welcome',
    messages: [
      {
        user: 'What is Custom Claude?',
        bot: `
          "Custom Claude" is a client for Anthropic Claude models. 

          - Use your own API key.
          - Select a model from the list.
          - Use dark/light mode.
        
          Notes:
          - If you don't have Anthropic API key, get one here: https://docs.anthropic.com/claude/reference/getting-started-with-the-api
          - Chat history is saved in LocalStorage and can be accessed from the side panel until cleared in Settings.
          - Haiku is the default model.
          - Opus is the best (but slowest).

        `,
      },
    ],
  };

  const handleVariableClick = (variableName) => {
    setInput(prevInput => {
      const newText = `${prevInput}{${variableName}}`;
  
      // To ensure cursor position update
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          const newCursorPos = newText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
  
      return newText;
    });
  };
  
  
  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    document.body.classList.remove('modal-open');
  };

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  useEffect(() => {
    const storedModelName = localStorage.getItem('modelName');
    if (storedModelName) {
      setModelName(storedModelName);
    } else {
      setModelName('claude-3-haiku-20240307');
    }
  }, []);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistory');
    if (storedChats) {
      setSavedChats(JSON.parse(storedChats));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);


  useEffect(() => {
    const storedVariables = localStorage.getItem('variables');
    if (storedVariables) {
      setVariables(JSON.parse(storedVariables));
    }
  }, []);

  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistory');
    if (storedChats) {
      setSavedChats(JSON.parse(storedChats));
    } else {
      setSavedChats([introChat]);
      setChatHistory(introChat.messages);
    }
  }, []);
  

  



  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleVariableEdit = (index) => {
    setEditingVariable(variables[index]);
    setIsVariableModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const handleVariableModalClose = () => {
    setIsVariableModalOpen(false);
    setEditingVariable(null);
    document.body.classList.remove('modal-open');
  };

  const handleVariableMouseEnter = (index) => {
    const variableControls = document.querySelectorAll('.variable-controls')[index];
    variableControls.classList.remove('hide');
  };
  
  const handleVariableMouseLeave = (index) => {
    const variableControls = document.querySelectorAll('.variable-controls')[index];
    variableControls.classList.add('hide');
  };
  

  const handleAddVariable = (name, content) => {
    if (editingVariable) {
      setVariables((prevVariables) => {
        const updatedVariables = prevVariables.map((variable) =>
          variable.name === editingVariable.name ? { name, content } : variable
        );
        localStorage.setItem('variables', JSON.stringify(updatedVariables));
        return updatedVariables;
      });
      setEditingVariable(null);
    } else {
      setVariables((prevVariables) => {
        const updatedVariables = [...prevVariables, { name, content }];
        localStorage.setItem('variables', JSON.stringify(updatedVariables));
        return updatedVariables;
      });
    }
    setIsVariableModalOpen(false);
  };


  const handleVariableDelete = (index) => {
    setVariables((prevVariables) => {
      const updatedVariables = [...prevVariables];
      updatedVariables.splice(index, 1);
      localStorage.setItem('variables', JSON.stringify(updatedVariables));
      return updatedVariables;
    });
  };




  const handleNewChat = () => {
    console.log(savedChats.length);
    if (savedChats.length === 0) {
      setSavedChats(prevSavedChats => {
        const updatedChats = [...prevSavedChats, newChat];
        localStorage.setItem('chatHistory', JSON.stringify(updatedChats)); // Update localStorage inside the callback
        return updatedChats;
      });
      setChatHistory([]);
    } else {
      // const newChat = { name: '', messages: [] };
      setChatHistory([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };



  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInput('');
    setIsLoading(true);
  
    let updatedInput = input;
    variables.forEach((variable) => {
      updatedInput = updatedInput.replace(
        new RegExp(`{${variable.name}}`, 'g'),
        variable.content
      );
    });
  
    if (chatHistory.length === 0) {
      const summaryResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `Summarize the following message in six words or less to use as a chat name: ${updatedInput}. Do not include the summary in blockquotes. Do not use dot at the end.`,
          apiKey,
          modelName,
        }),
      });
  
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        const chatName = summaryData.response.trim();
  
        const newChat = { name: chatName, messages: [] };
        const updatedSavedChats = [...savedChats, newChat];
        setSavedChats(updatedSavedChats);
        localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
  
        setChatHistory(newChat.messages);
  
        const botResponse = await handleRegularSubmit(updatedInput, newChat.messages);
        const updatedChatHistory = [{ user: updatedInput, bot: botResponse }];
        setChatHistory(updatedChatHistory);
  
        const updatedSavedChatsWithResponse = updatedSavedChats.map((chat) =>
          chat.name === chatName ? { ...chat, messages: updatedChatHistory } : chat
        );
        localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChatsWithResponse));
        setSavedChats(updatedSavedChatsWithResponse);
      } else {
        console.error('Error:', summaryResponse.statusText);
      }
    } else {
      const botResponse = await handleRegularSubmit(updatedInput, chatHistory);
      const updatedChatHistory = [...chatHistory, { user: updatedInput, bot: botResponse }];
      setChatHistory(updatedChatHistory);
  
      const updatedSavedChats = savedChats.map((chat, index) =>
        index === savedChats.length - 1 ? { ...chat, messages: updatedChatHistory } : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
      setSavedChats(updatedSavedChats);
    }
  
    setIsLoading(false);
  };







  const handleRegularSubmit = async (input, chatMessages) => {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, chatHistory: chatMessages, apiKey, modelName }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('LLM Response:', data.response);
      return data.response;
    } else {
      console.error('Error:', response.statusText);
      return '';
    }
  };



  const handleChatClick = (index) => {
    if (savedChats.length > 0) {
      const selectedChat = savedChats[index];
      if (selectedChat.messages) {
        setChatHistory(selectedChat.messages);
        setSelectedChatIndex(index); // Set the selected chat index
      } else {
        setChatHistory([]);
        setSelectedChatIndex(null); // Reset the selected chat index
      }
    }
  };


  const handleClearHistory = () => {
    localStorage.removeItem('chatHistory');
    setSavedChats([]);
    setChatHistory([]);
  };


  const handleSettingsSave = (newApiKey, newModelName) => {
    console.log('New Model Name:', newModelName);
    setApiKey(newApiKey);
    setModelName(newModelName);
    localStorage.setItem('modelName', newModelName);
    localStorage.setItem('apiKey', newApiKey);
  };






  return (
    <div className="container">
<VariableModal
  isOpen={isVariableModalOpen}
  onClose={handleVariableModalClose}
  onSave={handleAddVariable}
  initialName={editingVariable?.name || ''}
  initialContent={editingVariable?.content || ''}
/>
<header>
  <div className="header-left">
    <h1>Custom Claude</h1>
    
  </div>
  <div className="header-right">
  <h2 className="model-name">Model: {modelName}</h2>
    <label className="switch">
      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
      <span className="slider"></span>
    </label>
    <button onClick={handleSettingsOpen}>Settings</button>

  </div>
</header>
      <div className="content">
      <div className="side-panel">
      <div className="side-panel-header">
  <h2>Variables</h2>
  <button
    title="Add Variable"
    className="add-variable-button"
    onClick={() => setIsVariableModalOpen(true)}
  >
    <i className="fas fa-plus"></i>
  </button>
</div>
<ul className="variable-list">
  {variables.map((variable, index) => (
    <li
      key={index}
      className="variable-item"
      onClick={() => handleVariableClick(variable.name)}
      onMouseEnter={() => handleVariableMouseEnter(index)}
      onMouseLeave={() => handleVariableMouseLeave(index)}
    >
      <span className="variable-name">{variable.name}</span>
      <div className="variable-controls">
        <span
          className="edit-variable"
          onClick={(e) => {
            e.stopPropagation();
            handleVariableEdit(index);
          }}
        >
          <i className="fas fa-edit"></i>
        </span>
        <span
          className="delete-variable"
          onClick={(e) => {
            e.stopPropagation();
            handleVariableDelete(index);
          }}
        >
          &times;
        </span>
      </div>
    </li>
  ))}
</ul>
  <div className="side-panel-header">
    <h2>Chat History
    <button title="New chat" className="new-chat-button" onClick={handleNewChat}>
      <i className="fas fa-plus"></i>
    </button>
    </h2>
  </div>
  <ul>
  {savedChats.map((chat, index) => (
    <li key={index} onClick={() => handleChatClick(index)} 
    className={`chat-item ${selectedChatIndex === index ? 'selected' : ''}`}
    >
      {chat.name}
    </li>
  ))}
</ul>
</div>
        <div className="main-content">

          <div className="chat-window">
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <p className="user-message">{chat.user}</p>
                <div className="bot-message">
                  {chat.bot.split('```').map((part, i) => {
                    if (i % 2 === 1) {
                      return (
                        <pre key={i} className="code-block">
                          {part}
                        </pre>
                      );
                    } else {
                      return part.split('\n').map((line, j) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h2 key={`${i}-${j}`}>{line.slice(2, -2)}</h2>;
                        } else if (line.startsWith('*') && line.endsWith('*')) {
                          return <em key={`${i}-${j}`}>{line.slice(1, -1)}</em>;
                        } else if (line.trim() === '') {
                          return <br key={`${i}-${j}`} />;
                        } else {
                          return <p key={`${i}-${j}`}>{line}</p>;
                        }
                      });
                    }
                  })}
                </div>
              </div>
            ))}
            {isLoading && <div className="loading-indicator">Loading...</div>}
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={2}
            ></textarea>
            <button className="button-submit" type="submit">(Cmd + Enter) or Click</button>
          </form>
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};





export default Home;