'use client';

import { useState } from 'react';

const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

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
      const botResponse = data.response;
      setChatHistory([...chatHistory, { user: input, bot: botResponse[0].text }]);
      setInput('');
    } else {
      console.error('Error:', response.statusText);
    }
  };

  return (
    <div className="container">
      <h1>ChatGPT Clone</h1>
      <div className="chat-window">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <p className="user-message">{chat.user}</p>
            <p className="bot-message">{chat.bot}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Home;