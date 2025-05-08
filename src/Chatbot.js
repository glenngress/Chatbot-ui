import React, { useState } from 'react';
import logo from './assets/VerizonTitle.svg';
import './App.css';

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);

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
          setMessages(prev => [...prev, { isUser: false, responseContent }]);
        } else {
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setInput('');
    }
  };

  return (
    <div>
      {!isOpen ? (
        <button className="chatbot-toggle-button" onClick={() => setIsOpen(true)}>
          <img src={logo} alt="Chat" />
        </button>
      ) : (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <img src={logo} alt="Logo" />
              <div className="chatbot-header-title">
                <span>VZ Assistant</span>
              </div>
            </div>
            <button className="chatbot-close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="messages">
            {/* Greeting below the header */}
            {showGreeting && (
              <div className="chatbot-greeting">
                <p>Hello user, how may I assist you today?</p>
                <div className="example-card" onClick={() => {
                  setMessages(prev => [
                    ...prev,
                    { text: 'Create a request', isUser: true },
                    { text: 'Great, please provide me with the request details.', isUser: false }
                  ]);
                  setShowGreeting(false);
                }}>
                  Create a Request
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
                    <strong>Request Details</strong>
                    <table>
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Value</th>
                          <th>Suggested</th>
                          <th>Warnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(msg.responseContent.table).map(([field, details]) => (
                          <tr key={field}>
                            <td>{field}</td>
                            <td>{details.matched_value}</td>
                            <td>{details.suggested_matches.join(', ')}</td>
                            <td className={details.similarity < 0.8 ? 'low-similarity' : 'high-similarity'}>
                              {details.similarity < 0.8 ? 'Low similarity!' : '✓'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="confirm-buttons">
                      <button>Confirm</button>
                    </div>
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
