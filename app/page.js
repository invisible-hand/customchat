'use client';

import { useState, useEffect } from 'react';

const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);

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
  
      const botResponse = data.response;
      console.log(botResponse);
      const updatedChatHistory = [...chatHistory, { user: input, bot: botResponse }];
      setChatHistory(updatedChatHistory);
      setInput('');
  
      // Update the last entry in savedChats instead of appending a new entry
      const updatedSavedChats = [...savedChats.slice(0, -1), updatedChatHistory];
      localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
      setSavedChats(updatedSavedChats);
    } else {
      console.error('Error:', response.statusText);
    }
  };

  const handleChatClick = (index) => {
    const selectedChat = savedChats[index];
    console.log(selectedChat);
    setChatHistory(selectedChat);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('chatHistory');
    setSavedChats([]);
    setChatHistory([]);
  };


  return (
    <div className="container">
      <div className="side-panel">
        <h2>Chat History</h2>
        <ul>
          {savedChats.map((chat, index) => (
            <li key={index} onClick={() => handleChatClick(index)}>
              Chat {index + 1}
            </li>
          ))}
        </ul>
        <button className="clear-history-button" onClick={handleClearHistory}>
          Clear History
        </button>
      </div>
      <div className="main-content">
        <h1>Custom Claude</h1>
        <button className="new-chat-button" onClick={handleNewChat}>
          New Chat
        </button>

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
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={4}
          ></textarea>
          <button type="submit">(Cmd + Enter) or Click</button>
        </form>
      </div>
    </div>
  );
};

export default Home;