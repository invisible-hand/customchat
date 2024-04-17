'use client';

import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';



const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');


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
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  


  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistory');
    if (storedChats) {
      setSavedChats(JSON.parse(storedChats));
    }
  }, []);

  const handleNewChat = () => {
    // Clear the chat history only if it's not already clear
    // This prevents adding duplicate chats if there's no new message yet
    if (chatHistory.length > 0) {
        const newChat = [...chatHistory];  // Copy the current chat history
        setSavedChats(prevSavedChats => [...prevSavedChats, newChat]);  // Add the copied chat to saved chats
        setChatHistory([]);  // Clear the current chat history for a new session
    } else if (savedChats.length === 0 || savedChats[savedChats.length - 1].length !== 0) {
        // If there is no chat history and the last saved chat is not empty, add a new empty chat
        // This condition checks if the last saved chat is not empty to avoid adding consecutive empty chats
        setSavedChats(prevSavedChats => [...prevSavedChats, []]);  // Add a new empty chat array
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
  
    if (chatHistory.length === 0) {
      const summaryResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: `Summarize in five words or less: ${input}`, apiKey, modelName }),
      });
  
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        const summary = summaryData.response;
  
        const updatedSavedChats = [...savedChats, [{ user: summary, bot: '' }, { user: input, bot: '' }]];
        setSavedChats(updatedSavedChats);
        localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
  
        setChatHistory([{ user: input, bot: '' }]);
  
        const botResponse = await handleRegularSubmit(input, [{ user: input, bot: '' }]);
        const updatedChatHistory = [{ user: input, bot: botResponse }];
        setChatHistory(updatedChatHistory);
  
        const updatedSavedChatsWithResponse = [...savedChats, [{ user: summary, bot: '' }, ...updatedChatHistory]];
        localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChatsWithResponse));
        setSavedChats(updatedSavedChatsWithResponse);
      } else {
        console.error('Error:', summaryResponse.statusText);
      }
    } else {
      const botResponse = await handleRegularSubmit(input, [...chatHistory, { user: input, bot: '' }]);
      const updatedChatHistory = [...chatHistory, { user: input, bot: botResponse }];
      setChatHistory(updatedChatHistory);

      const updatedSavedChats = savedChats.map((chat, index) =>
        index === savedChats.length - 1 ? updatedChatHistory : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
      setSavedChats(updatedSavedChats);
    }

    setIsLoading(false);
  };

  const handleRegularSubmit = async (input, chatHistory) => {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, chatHistory, apiKey, modelName  }),
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
      const selectedChat = savedChats[index].slice(0);
      setChatHistory(selectedChat);
    }
  };


  // const handleChatClick = (index) => {
  //   if (savedChats.length > 0) {
  //     const selectedChat = savedChats[index];
  //     const chatName = selectedChat[0]?.user || `Chat ${index + 1}`;
  //     console.log(`Selected chat: ${chatName}`);
  //     setChatHistory(selectedChat);
  //   }
  // };

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

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };




  return (
    <div className="container">
<header>
  <div className="header-left">
    <h1>Custom Claude</h1>
    <h2 className="model-name">Model: {modelName}</h2>
  </div>
  <div className="header-right">
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
    <h2>Chat History
    <button title="New chat" className="new-chat-button" onClick={handleNewChat}>
      <i className="fas fa-file"></i>
    </button>
    </h2>
  </div>
  <ul>
    {savedChats.map((chat, index) => (
        <li key={index} onClick={() => handleChatClick(index)} className="chat-item">
            {chat.length > 0 && chat[0].user ? chat[0].user.charAt(0).toUpperCase() + chat[0].user.slice(1) : `Chat ${index + 1}`}
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
              rows={4}
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