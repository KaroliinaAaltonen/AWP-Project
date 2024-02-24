import React, { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import './main.css';
import { useTranslation } from 'react-i18next';

function ChatView({ chatId, isOpen, sender }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatViewRef = useRef(null);

  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found');
      return null;
    }
    const decodedToken = jwtDecode(authToken);
    return decodedToken.username;
  };

  const sendMessage = async () => {
    try {
      const sender = usernameFromToken();
      const timestamp = new Date().toISOString(); // Get the current timestamp in ISO 8601 format
      const response = await fetch(`/api/conversations/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, content: newMessage, timestamp }) // Include the timestamp
      });
  
      if (response.ok) {
        fetchMessages();
        setNewMessage('');
      } else {
        console.error('Error sending message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${chatId}/get-messages`);
      if (response.ok) {
        const data = await response.json();
        console.log(data); // Log the data to check the structure and timestamp format
        setMessages(data.messages);
        if (chatViewRef.current) {
          chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
      } else {
        console.error('Error fetching messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

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
            <div className="message-content">
              <span className="message-text">{message.content}</span>
              <span className="message-timestamp">{new Date(message.timestamp).toLocaleString()}</span> {/* Display timestamp */}
            </div>
          </li>
        ))}
        </ul>
      )}
      </div>
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
