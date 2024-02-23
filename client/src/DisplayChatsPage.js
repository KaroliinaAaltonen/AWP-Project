import React, { useEffect, useState } from 'react';
import Header from './Header';
import ChatView from './ChatView'; // Import the ChatView component
import { jwtDecode } from "jwt-decode";

function DisplayChatsPage() {
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedChat, setSelectedChat] = useState(null); // State to manage selected chat

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

  // Function to fetch username based on user ID
  const fetchUsername = async (userId) => {
    try {
      // Fetch user info based on user ID
      const response = await fetch(`/api/userInfoById/${userId}`);
      const data = await response.json();
      const username = data.userInfo.username;
      return username;
    } catch (error) {
      console.error('Error fetching username:', error);
      return '';
    }
  };

  useEffect(() => {
    // Fetch chats from backend
    const fetchData = async () => {
      try {
        const username = usernameFromToken();
        setCurrentUser(username);
        const response = await fetch(`/api/conversations/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        
        // Fetch usernames for each participant
        const updatedChats = await Promise.all(data.conversations.map(async (chat) => {
          const updatedParticipants = await Promise.all(chat.participants.map(async (participant) => {
            return await fetchUsername(participant);
          }));
          return { ...chat, participants: updatedParticipants };
        }));
        
        setChats(updatedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchData();
  }, []);

  // Function to handle chat selection
  const handleChatSelection = (chatId) => {
    setSelectedChat(prevSelectedChat => (prevSelectedChat === chatId ? null : chatId));
  };

  return (
    <div>
      <Header />
      <div className="title-container">
        <h2>Your Conversations</h2>
        <div className="chat-container">
          <div className="matches-list">
            {chats.length > 0 ? (
              chats.map(chat => (
                <div key={chat._id} className={`match ${selectedChat === chat._id ? 'selected' : ''}`} onClick={() => handleChatSelection(chat._id)}>
                  <h3>{chat.participants.filter(participant => participant !== currentUser)}</h3>
                </div>
              ))
            ) : (
              <p>If you see this message you need to secure some matches before chatting</p>
            )}
          </div>
          <div className="chat-view">
            {selectedChat && (
              <ChatView chatId={selectedChat} isOpen={true} sender={currentUser} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayChatsPage;
