'use client';

import { useState, useEffect } from 'react';


const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
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
    setChatHistory([]);
    const newChat = [];
    setSavedChats([...savedChats, newChat]);
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
        body: JSON.stringify({ input: `Summarize in five words or less: ${input}` }),
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

        const updatedSavedChatsWithResponse = savedChats.map((chat, index) =>
          index === savedChats.length - 1 ? [{ user: summary, bot: '' }, ...updatedChatHistory] : chat
        );
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
      body: JSON.stringify({ input, chatHistory }),
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

  return (
    <div className="container">
<header>
  <div className="header-left">
    <h1>Custom Claude</h1>
    <h2 className="model-name">Model: {process.env.NEXT_PUBLIC_MODEL_NAME}</h2>
  </div>
  <div className="header-right">
    <label className="switch">
      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
      <span className="slider"></span>
    </label>
  </div>
</header>
      <div className="content">
        <div className="side-panel">

          <h1>Chat History</h1>
          <button className="new-chat-button" onClick={handleNewChat}>
            New Chat
          </button>
          <ul>
            {savedChats.map((chat, index) => (
              <li key={index} onClick={() => handleChatClick(index)} className="chat-item">
                {chat[0]?.user ? chat[0].user.charAt(0).toUpperCase() + chat[0].user.slice(1) : `Chat ${index + 1}`}
              </li>
            ))}
          </ul>
          <button className="clear-history-button" onClick={handleClearHistory}>
            Clear History
          </button>
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
            <button class="button-submit" type="submit">(Cmd + Enter) or Click</button>
          </form>
        </div>
      </div>
    </div>
  );
};





export default Home;