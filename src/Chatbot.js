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
    <div className="chatbot-container" style={{ 
      width: '350px', 
      height: '500px', 
      border: '1px solid #ccc', 
      padding: '10px', 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px',
      backgroundColor: '#ffffff', // <-- add this
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // optional: for subtle shadow
      borderRadius: '10px', // optional: rounded corners
      overflowY: 'auto', // <-- add this
      borderColor: 'rgba(255, 0, 0, 0.59)',
      borderWidth: '3px',
      borderStyle: 'solid'
    }}>
      {/* Chatbot Header */}
      <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px', backgroundColor: '#ed3726', color: 'white', borderRadius: '8px', marginBottom: '15px' }}>
        <img src={logo} alt="Logo" style={{ width: '30px', height: '30px' }} />
        
        <span>Hello user, how may I assist you today?</span>
        <div></div>
      </div>

      <div
        className="messages"
      >
      {messages.map((msg, index) => (
  <div className='textmsg' key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: msg.isUser ? 'flex-end' : 'flex-start' }}>
    {msg.isUser ? (
      <div style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignContent: 'flex-start', backgroundColor: '#2c3e50', color: 'white' }} className="bubble user-message ">{msg.text}</div>
    ) : msg.responseContent ? (
      <div style={{  }} className="bubble bot-message">
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
          style={{ borderRadius: '5px', backgroundColor: '#f2f2f2', width: '80%', padding: '5px' }}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} style={{ borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' ,padding: '5px', marginLeft: '10px' }}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;