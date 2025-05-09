import React, { useState } from 'react';
import logo from './assets/VerizonTitle.svg';
import './App.css';

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { text: input, isUser: true }]);
      try {
        const response = await fetch('http://localhost:8080/process_input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_text: input })
        });

        if (response.ok) {
          const data = await response.json();
          const responseContent = {
            processed_text: data.processed_text,
            table: data.extracted_fields
          };

          const newMessages = [];

          if (isCreatingRequest) {
            newMessages.push({
              isUser: false,
              text: "These are the request details based on your input. Please confirm if you'd like to create request."
            });
            setIsCreatingRequest(false); // reset the flow
          }

          newMessages.push({ isUser: false, responseContent });

          setMessages(prev => [...prev, ...newMessages]);
        } else {
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setInput('');
    }
  };

  const handleConfirm = () => {
    if (!hasConfirmed) {
      const generatedId = Math.floor(100000 + Math.random() * 900000);
      setRequestId(generatedId);
      setMessages(prev =>
        prev.map(msg => {
          if (msg.responseContent) {
            return {
              ...msg,
              responseContent: {
                ...msg.responseContent,
                requestId: generatedId
              }
            };
          }
          return msg;
        })
      );
      setHasConfirmed(true);
    }
  };

  return (
    <div>
      {!isOpen ? (
        <button className="chatbot-toggle-button" onClick={() => setIsOpen(true)}>
          <img src={logo} alt="Chat" />
        </button>
      ) : (
        <div className={`chatbot-container ${isMaximized ? 'maximized' : ''}`}>
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <img src={logo} alt="Logo" />
              <div className="chatbot-header-title">
                <span>VZ Assistant</span>
              </div>
            </div>
            <button
              className="chatbot-maximize-button"
              onClick={() => setIsMaximized(prev => !prev)}
            >
              {isMaximized ? '🗗' : '🗖'}
            </button>
            <button className="chatbot-close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="messages">
            {showGreeting && (
              <div className="chatbot-greeting">
                <p>Hello user, how may I assist you today?</p>
                <div className="example-card" onClick={() => {
                  setMessages(prev => [
                    ...prev,
                    { text: 'Create Request', isUser: true },
                    { text: 'Please provide me with the details for your request', isUser: false }
                  ]);
                  setShowGreeting(false);
                  setIsCreatingRequest(true);
                }}>
                  Create Request
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.isUser ? 'user' : 'bot'}`}
              >
                {msg.isUser ? (
                  <div className="bubble user-message">{msg.text}</div>
                ) : msg.responseContent ? (
                  <div className="bubble bot-message response-table">
                    {!msg.responseContent.requestId ? (
                      <p className="message-title">Request Details</p>
                    ) : (
                      <>
                        <p className="message-title success">Request created successfully</p>
                        <p>
                        <strong>Request ID:</strong>{' '}
                        <strong>
                          <a
                            href={`/requests/${msg.responseContent.requestId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {msg.responseContent.requestId}
                          </a>
                        </strong>
                        
                      </p>
                      </>
                    )}
                    <table>
                      <thead>
                        <tr>
                          {["Network", "Activity Category", "Service Impact", "Risk Level"].map(field => (
                            <th key={field}>{field}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {["Network", "Activity Category", "Service Impact", "Risk Level"].map(field => (
                            <td key={field}>
                              {msg.responseContent.table[field]?.matched_value || "-"}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                    {!hasConfirmed && (
                      <div className="confirm-buttons">
                        <button onClick={handleConfirm}>Confirm</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bubble bot-message">{msg.text}</div>
                )}
              </div>
            ))}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
