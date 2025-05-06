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
      // Add user message
      setMessages(prevMessages => [...prevMessages, { text: input, isUser: true }]);
  
      try {
        const response = await fetch('http://localhost:8080/process_input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_text: input })
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Received response:", data);
  
          // If extracted_fields exist, render a table
          if (data.extracted_fields) {
            const table = (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid white', padding: '5px', alignItems: 'left'}}>Field</th>
                    <th style={{ border: '1px solid white', padding: '5px' }}>Value</th>
                    <th style={{ border: '1px solid white', padding: '5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.extracted_fields).map(([field, info]) => (
                    <tr key={field}>
                      <td style={{ border: '1px solid white', padding: '5px' }}>{field}</td>
                      <td style={{ border: '1px solid white', padding: '5px' }}>{info.extracted_value}</td>
                      <td style={{ border: '1px solid white', padding: '5px' }}>{info.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
  
            // Display the processed_text + the table
            setMessages(prev => [
              ...prev,
              { text: data.processed_text, isUser: false },
              { text: table, isUser: false }
            ]);
          } else {
            setMessages(prevMessages => [...prevMessages, { text: data.response, isUser: false }]);
          }
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
        <div
          key={index}
          className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}
        >
          {typeof msg.text === 'string' ? msg.text : msg.text}
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