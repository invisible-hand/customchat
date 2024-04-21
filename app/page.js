'use client';

import { useState, useEffect, useRef } from 'react';
import VariableModal from './VariableModal';
import ReactMarkdown from 'react-markdown';

const Home = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [variables, setVariables] = useState([]);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const introChat = {
    name: 'Welcome',
    messages: [
      {
        user: 'What is this?',
        bot: ` line one  
          line one  
          line two   
          line three
        `,
      },
    ],
  };

  const handleClearChats = () => {
    setSavedChats([]);
    setChatHistory([]);
    localStorage.removeItem('chatHistory'); // Remove chat history from local storage
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
  


  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
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
      const chats = JSON.parse(storedChats);
      setSavedChats(chats);
      setChatHistory(chats.length > 0 ? chats[0].messages : []);
    } else {
      localStorage.setItem('chatHistory', JSON.stringify([introChat]));
      setSavedChats([introChat]);
      setChatHistory(introChat.messages);
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
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const ChatMessage = ({ content }) => {
    return (
      <div className="chat-message">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };


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

  const handleInput = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to scroll height
  };




 

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };



  const handleNewChat = () => {
    // Default new chat with a placeholder name
    const newChat = {
      name: 'New Chat', // Temporary name until the first message
      messages: []
    };
    setSavedChats((prevChats) => [...prevChats, newChat]);
    setChatHistory([]);
    setSelectedChatIndex(savedChats.length); // Set focus on the new chat
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setInput('');
  
    let updatedInput = input.trim();
    if (updatedInput === '') {
      return; // Prevent empty chat submissions
    }
  
    // Replace variables with their actual content
    variables.forEach((variable) => {
      updatedInput = updatedInput.replace(new RegExp(`{${variable.name}}`, 'g'), variable.content);
    });
  
    const botResponse = await handleRegularSubmit(updatedInput, chatHistory);
    
    // Check if it's a new chat without any messages or named 'New Chat'
    const isNewChat = selectedChatIndex === null || (savedChats[selectedChatIndex] && savedChats[selectedChatIndex].name === 'New Chat');
    
    if (isNewChat && chatHistory.length === 0) {
      // API call to dynamically name the chat based on the first message
      try {
        const summaryResponse = await fetch('/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `DO NOT USE QUOTES! Summarize this in six words or less: ${updatedInput}. `,
            apiKey,
            modelName,
          }),
        });
  
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          savedChats[savedChats.length - 1].name = summaryData.response.trim() || 'New Chat'; // Update last chat's name
        }
      } catch (error) {
        console.error('Error during summarization:', error);
      }
    }
  
    // Update chat messages
    const newMessage = { user: updatedInput, bot: botResponse };
    const updatedChatHistory = [...chatHistory, newMessage];
    const updatedChats = savedChats.map((chat, index) =>
      index === selectedChatIndex ? { ...chat, messages: updatedChatHistory } : chat
    );
  
    localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
    setSavedChats(updatedChats);
    setChatHistory(updatedChatHistory);
  };
  
  
  



  const handleChatClick = (index) => {
    const selectedChat = savedChats[index];
    setChatHistory(selectedChat.messages);
    setSelectedChatIndex(index);
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
    <h1>Llamachat</h1>
    <h2 className="model-name">Model: llama3-8b-8192</h2>

    
  </div>
    <label className="switch">
      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
      <span className="slider"></span>
    </label>
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
<button className="clear-chats-button" onClick={handleClearChats}>
        Clear Chat History
      </button>
</div>
        <div className="main-content">
                    <div className="chat-window">
              {chatHistory.length === 0 ? (
                <div className="chat-placeholder">Something magical is about to happen...</div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className="chat-message">
                    <p className="user-message">{chat.user}</p>
                    <div className="bot-message">
                      <ReactMarkdown>{chat.bot}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={handleInput} 
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={2}
              style={{ overflow: 'hidden' }}
            ></textarea>
            <button className="button-submit" type="submit">(Cmd + Enter) or Click</button>
          </form>
        </div>
      </div>
    </div>
  );
};





export default Home;