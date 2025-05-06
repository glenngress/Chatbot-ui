import React, { useState } from 'react';
import logo from './assets/V1.jpg'
<style>
  {`
    .message {
      max-width: 70%;
      padding: 10px;
      border-radius: 15px;
      margin-bottom: 8px;
      color: white;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .user-message {
      background-color: #e74c3c;
      align-self: flex-end;
      border-bottom-right-radius: 0;
    }

    .bot-message {
      background-color: #2c3e50;
      align-self: flex-start;
      border-bottom-left-radius: 0;
    }

    .messages {
      display: flex;
      flex-direction: column;
      padding: 10px;
      overflow-y: auto;
      height: 80%;
    }
  `}
</style>
const Chatbot = () => {
  const [input, setInput] = useState(""); // User input
  const [messages, setMessages] = useState([]); // Chat messages

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
    <div className="chatbot-container" style={{ width: '350px', height: '500px', border: '1px solid #ccc', padding: '10px', position: 'fixed', bottom: '10px', right: '10px' }}>
      {/* Chatbot Header */}
      <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#ed3726', color: 'white' }}>
        <img src={logo} alt="Logo" style={{ width: '30px', height: '30px' }} />
        <span>How may we assist you today?</span>
      </div>

      <div
        className="messages"
      >
      {messages.map((msg, index) => (
  <div key={index} style={{ marginBottom: '10px' }}>
    {msg.isUser ? (
      <div className="user-message bubble">{msg.text}</div>
    ) : msg.responseContent ? (
      <div className="bot-message bubble">
        <strong>{"Request Details"}</strong>
        <table style={{ marginTop: '8px', width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc' }}>Field</th>
              <th style={{ border: '1px solid #ccc' }}>Value</th>
              <th style={{ border: '1px solid #ccc' }}>Suggested Matches</th>
              <th style={{ border: '1px solid #ccc' }}>Warnings</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(msg.responseContent.table).map(([field, details]) => (
              <tr key={field}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{field}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{details.matched_value}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>
                  {details.suggested_matches.join(', ')}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '4px', color: details.similarity < 0.8 ? 'red' : 'green' }}>
                  {details.similarity < 0.8 ? 'Low similarity!' : '✓'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Confirm/Edit Buttons */}
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
            Confirm
          </button>
          <button style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>
            Edit
          </button>
        </div>
      </div>
    ) : (
      <div className="bot-message bubble">{msg.text}</div>
    )}
  </div>
))}
    </div>


      <div className="input-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '80%', padding: '5px' }}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} style={{ padding: '5px', marginLeft: '10px' }}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;