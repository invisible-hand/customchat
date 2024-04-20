'use client';

import { useState, useEffect, useRef } from 'react';
import SettingsModal from './SettingsModal';
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

  // useEffect(() => {
  //   const storedModelName = localStorage.getItem('modelName');
  //   if (storedModelName) {
  //     setModelName(storedModelName);
  //   } else {
  //     setModelName('claude-3-haiku-20240307');
  //   }
  // }, []);

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




  const handleNewChat = () => {
    console.log(savedChats.length);
    if (savedChats.length === 0) {
        const newChat = { 
            name: 'New Chat', // Give a default name or generate one dynamically
            messages: [] // Initialize with an empty messages array
        };
        setSavedChats(prevSavedChats => {
            const updatedChats = [...prevSavedChats, newChat];
            localStorage.setItem('chatHistory', JSON.stringify(updatedChats)); // Update localStorage inside the callback
            return updatedChats;
        });
        setChatHistory([]); // Assuming you want to reset the current chat history in the UI
    } else {
        // Handle the case when there are already chats
        // You might want to select a new chat or clear the current one
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
  
    let updatedInput = input;
    variables.forEach((variable) => {
      updatedInput = updatedInput.replace(
        new RegExp(`{${variable.name}}`, 'g'),
        variable.content
      );
    });
  
    // Check if a new chat needs to be created
    if (chatHistory.length === 0 && updatedInput.trim() !== '') {
      // Attempt to summarize the chat content for a new chat name
      let chatName = 'New Chat'; // Default chat name
  
      try {
        const summaryResponse = await fetch('/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `Summarize the following message in six words or less to use as a chat name: ${updatedInput}. Important: Do not use quotes in your reply! Do not reply to the question, merely summarize what it means and rephrase is needed.`,
            apiKey,
            modelName,
          }),
        });
  
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          chatName = summaryData.response.trim() || 'New Chat';
        } else {
          console.error('Error:', summaryResponse.statusText);
        }
      } catch (error) {
        console.error('Error during summarization:', error);
      }
  
      const newChat = { name: chatName, messages: [] };
      setSavedChats((prevSavedChats) => {
        const updatedChats = [...prevSavedChats, newChat];
        localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
        setSelectedChatIndex(updatedChats.length - 1); // Set the selected chat index to the newly created chat

        return updatedChats;
      });
      setSelectedChatIndex(savedChats.length);
    }
  
    // Now handle the message submission to LLM
    const botResponse = await handleRegularSubmit(updatedInput, chatHistory);
    const updatedChatHistory = [...chatHistory, { user: updatedInput, bot: botResponse }];
  
    // Update the current chat in savedChats
    setSavedChats((prevSavedChats) => {
      const updatedChats = prevSavedChats.map((chat, index) =>
        index === selectedChatIndex ? { ...chat, messages: updatedChatHistory } : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
      return updatedChats;
    });
  
    // Update the chatHistory state with the new message
    setChatHistory(updatedChatHistory);
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
        setSelectedChatIndex(index); // Set the selected chat index to the clicked chat
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
  <h2 className="model-name">Model: llama3-8b-8192</h2>
    <label className="switch">
      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
      <span className="slider"></span>
    </label>
    {/* <button onClick={handleSettingsOpen}>Settings</button> */}

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
          {/* <div className="chat-window">
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
          </div> */}
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
      {/* <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
        onClearHistory={handleClearHistory}
      /> */}
    </div>
  );
};





export default Home;