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
  
    if (chatHistory.length === 1 && chatHistory[0].user === '') {
      // This is the first message of a new chat
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: `Summarize in five words or less: ${input}` }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const summary = data.response;
  
        // Add the summary as the name of the saved chat
        const updatedSavedChats = [...savedChats.slice(0, -1), [{ user: input, bot: '' }]];
        setSavedChats(updatedSavedChats);
        localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
  
        // Proceed with the regular handleSubmit logic
        const botResponse = await handleRegularSubmit(input, updatedSavedChats[updatedSavedChats.length - 1]);
        setChatHistory([{ user: input, bot: botResponse }]);
      } else {
        console.error('Error:', response.statusText);
      }
    } else {
      // Regular message in an existing chat
      const botResponse = await handleRegularSubmit(input, chatHistory);
      const updatedChatHistory = [...chatHistory, { user: input, bot: botResponse }];
      setChatHistory(updatedChatHistory);
  
      // Update the last entry in savedChats
      const updatedSavedChats = [...savedChats.slice(0, -1), updatedChatHistory];
      localStorage.setItem('chatHistory', JSON.stringify(updatedSavedChats));
      setSavedChats(updatedSavedChats);
    }
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
      const selectedChat = savedChats[index];
      const chatName = selectedChat[0]?.user || `Chat ${index + 1}`;
      console.log(`Selected chat: ${chatName}`);
      setChatHistory(selectedChat);
    }
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
              {chat[0]?.user || `Chat ${index + 1}`}
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
              {index === 0 && <h2>{chat.user || 'Untitled Chat'}</h2>}
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