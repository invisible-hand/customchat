'use client';

import { useState } from 'react';

const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleNewChat = () => {
    setChatHistory([]);
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
      console.log('LLM Response:', data.response); // Log the response data

      const botResponse = data.response;
      setChatHistory([...chatHistory, { user: input, bot: botResponse[0].text }]);
      setInput('');
    } else {
      console.error('Error:', response.statusText);
    }
  };

  return (
    <div className="container">
      <h1>Custom Claude</h1>
      <button className="new-chat-button" onClick={handleNewChat}>New Chat</button>

      <div className="chat-window">
  {chatHistory.map((chat, index) => (
    <div key={index}>
      <p className="user-message">{chat.user}</p>
      <div className="bot-message">
        {chat.bot.split('```').map((part, i) => {
          if (i % 2 === 1) {
            return <pre key={i} className="code-block">{part}</pre>;
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
          rows={4}>

  </textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};



export default Home;