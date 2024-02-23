import React, { useEffect, useState, useRef } from 'react'; // Import features from react
import { Button, Form } from 'react-bootstrap'; // Import bootstrap features
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode for decoding JWT tokens
import './main.css'; // Import the CSS file

function ChatView({ chatId, isOpen, sender }) {
  // Reference to the containers
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatViewRef = useRef(null); 

  // Function to extract username from JWT token
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found');
      return null;
    }
    const decodedToken = jwtDecode(authToken);
    return decodedToken.username;
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
            console.error('Error sending message:', response.statusText);
        }
        } catch (error) {
        console.error('Error sending message:', error);
        }
    };
  
  // Fetch messages for the selected chat
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${chatId}/get-messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        // Scroll to the bottom of the chat view after updating messages
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
  }, [isOpen, chatId]); // Run this effect whenever isOpen or chatId changes

  return (
    <div className={`chatview-chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chatview-chat-view" ref={chatViewRef}>
        {messages.length === 0 ? (
          <p className="empty-chat">*crickets*</p>
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
      <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <Form.Group controlId="formNewMessage" className="chatview-form-group">
          <Form.Control 
            type="text" 
            placeholder="Type your message here" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="chatview-form-control"
          />
          <Button type="submit" variant="primary" className="chatview-send-button">Send</Button>
        </Form.Group>
      </Form>
    </div>
  );
}

export default ChatView;
