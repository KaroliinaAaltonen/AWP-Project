import React, { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode'; // Importing jwtDecode library for decoding JWT tokens
import './main.css'; // Importing CSS file for styling
import { useTranslation } from 'react-i18next'; // Importing useTranslation hook for internationalization

function ChatView({ chatId, isOpen, sender, searchKeyword }) {
  const { t } = useTranslation(); // Initializing translation hook
  const [messages, setMessages] = useState([]); // State variable for storing messages
  const [newMessage, setNewMessage] = useState(''); // State variable for new message input
  const chatViewRef = useRef(null); // Reference for chat view container

  // Function to extract username from JWT token stored in localStorage
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found');
      return null;
    }
    const decodedToken = jwtDecode(authToken);
    return decodedToken.username;
  };

  // Function to send a new message to the server
  const sendMessage = async () => {
    try {
      const sender = usernameFromToken(); // Get the sender's username
      const timestamp = new Date().toISOString(); // Get the current timestamp in ISO 8601 format
      const response = await fetch(`/api/conversations/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, content: newMessage, timestamp }) // Include the message content and timestamp in the request body
      });
  
      if (response.ok) {
        fetchMessages(); // Fetch updated messages after sending the new message
        setNewMessage(''); // Clear the new message input field
      } else {
        console.error('Error sending message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Effect hook to fetch messages when the component mounts or when the chat is opened
useEffect(() => {
  if (isOpen) {
    fetchMessages();
  }
}, [isOpen, chatId, searchKeyword]);

// Function to fetch messages from the server
const fetchMessages = async () => {
  try {
    const response = await fetch(`/api/conversations/${chatId}/get-messages`);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // Log the fetched data
      setMessages(data.messages); // Update the messages state with the fetched messages
      if (chatViewRef.current) {
        chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight; // Scroll to the bottom of the chat view
      }
    } else {
      console.error('Error fetching messages:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

  // Effect hook to fetch messages when the component mounts or when the chat is opened
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, chatId, searchKeyword]);
  // Messages filtered by the word search
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Function to render highlighted messages based on the search keyword
  const renderHighlightedMessage = (content) => {
    if (!searchKeyword) return content; // Return the original content if there's no search keyword
    
    // Create a regular expression with the search keyword for global case-insensitive matching
    const regex = new RegExp(searchKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    // Replace all occurrences of the search keyword with <mark> tags for highlighting
    return content.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  return (
    <div className={`chatview-chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chatview-chat-view" ref={chatViewRef}>
        {/* Conditionally render messages or a placeholder message if no messages are available */}
        {filteredMessages.length === 0 ? (
          <p className="empty-chat">{t('crickets')}</p>
        ) : (
          <ul>
            {/* Map through messages and render each message with sender information */}
            {filteredMessages.map(message => (
              <li key={message._id} className={message.sender === sender ? 'user-message' : 'other-message'}>
                <div className="message-content">
                  {/* Render message content with highlighted search keyword */}
                  <span className="message-text" dangerouslySetInnerHTML={{ __html: renderHighlightedMessage(message.content) }}></span>
                  {/* Display message timestamp */}
                  <span className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Form for sending new messages */}
      <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <Form.Group controlId="formNewMessage" className="chatview-form-group">
          {/* Input field for typing new messages */}
          <Form.Control 
            type="text" 
            placeholder={t('type message')} 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="chatview-form-control"
          />
          {/* Button to submit new message */}
          <Button type="submit" variant="primary" className="chatview-send-button">{t('send')}</Button>
        </Form.Group>
      </Form>
    </div>
  );
}

export default ChatView;
