// client/src/DisplayChatsPage.js
import React, { useEffect, useState } from 'react'; // Import features from react
import Header from './Header'; // Import the Header component
import ChatView from './ChatView'; // Import the ChatView component
import { jwtDecode } from "jwt-decode"; // Import jwt-decode for decoding JWT tokens
import { useTranslation } from 'react-i18next'; // Import translation hook

function DisplayChatsPage() {
  const { t } = useTranslation(); // Initialize translation hook
  const [chats, setChats] = useState([]); // State variable for chats
  const [currentUser, setCurrentUser] = useState(''); // State variable for current user
  const [selectedChat, setSelectedChat] = useState(null); // State to manage selected chat

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
        const username = usernameFromToken(); // Get current user's username from the token
        setCurrentUser(username); // Set the current user state
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
        
        setChats(updatedChats); // Update chats state with fetched chats
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchData();
  }, []); // Run this effect once when the component mounts

  // Function to handle chat selection
  const handleChatSelection = (chatId) => {
    setSelectedChat(prevSelectedChat => (prevSelectedChat === chatId ? null : chatId));
  };

  return (
    <div>
      <Header /> {/* Render the Header component */}
      <div className="title-container">
        <h2>{t('conversations')}</h2>
        <div className="chat-container">
          <div className="matches-list">
            {chats.length > 0 ? (
              chats.map(chat => (
                <div key={chat._id} className={`match ${selectedChat === chat._id ? 'selected' : ''}`} onClick={() => handleChatSelection(chat._id)}>
                  <h3>{chat.participants.filter(participant => participant !== currentUser)}</h3>
                </div>
              ))
            ) : (
              <p>{t('no matches')}</p>
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
