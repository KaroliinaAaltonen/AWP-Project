// client/src/ChatView.js
import React, { useEffect, useState, useRef } from 'react'; // Import features from react
import { Button, Form } from 'react-bootstrap'; // Import bootstrap features
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for decoding JWT tokens
import './main.css'; // Import the CSS file
import { useTranslation } from 'react-i18next';

function ChatView({ chatId, isOpen, sender }) {
  const { t } = useTranslation(); // Initialize translation hook
  const [messages, setMessages] = useState([]); // State variable for messages
  const [newMessage, setNewMessage] = useState(''); // State variable for new message
  const chatViewRef = useRef(null); // Reference to the chat view container

  // Function to extract username from JWT token
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
    if (!authToken) {
      console.error('Authentication token not found'); // Log error if authentication token is not found
      return null;
    }
    const decodedToken = jwtDecode(authToken); // Decode JWT token
    return decodedToken.username; // Return the username extracted from the token
  };

  // Function to handle sending a new message
  const sendMessage = async () => {
    try {
      // Get sender's username from the token
      const sender = usernameFromToken(); 
      // Send the new message to the backend with the sender's username
      const response = await fetch(`/api/conversations/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, content: newMessage }) // Send the sender's username along with the content of the new message
      });

      if (response.ok) {
        // Fetch updated messages after sending the new message
        fetchMessages();
        // Clear the text input field after sending the message
        setNewMessage('');
      } else {
        console.error('Error sending message:', response.statusText); // Log error if message sending fails
      }
    } catch (error) {
      console.error('Error sending message:', error); // Log error if message sending fails
    }
  };

  // Function to fetch messages for the selected chat
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${chatId}/get-messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages); // Update messages state with fetched messages
        // Scroll to the bottom of the chat view after updating messages
        if (chatViewRef.current) {
          chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
      } else {
        console.error('Error fetching messages:', response.statusText); // Log error if fetching messages fails
      }
    } catch (error) {
      console.error('Error fetching messages:', error); // Log error if fetching messages fails
    }
  };

  // Effect to fetch messages when the chat view is opened or chatId changes
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, chatId]);

  return (
    <div className={`chatview-chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chatview-chat-view" ref={chatViewRef}>
        {messages.length === 0 ? (
          <p className="empty-chat">{t('crickets')}</p>
        ) : (
          <ul>
            {messages.map(message => (
              <li key={message._id} className={message.sender === sender ? 'user-message' : 'other-message'}>
                <strong>{message.sender}: </strong>{message.content}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Form for sending a new message */}
      <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <Form.Group controlId="formNewMessage" className="chatview-form-group">
          <Form.Control 
            type="text" 
            placeholder={t('type message')} 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="chatview-form-control"
          />
          <Button type="submit" variant="primary" className="chatview-send-button">{t('send')}</Button>
        </Form.Group>
      </Form>
    </div>
  );
}

export default ChatView;
