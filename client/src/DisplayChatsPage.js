import React, { useEffect, useState } from 'react';
import Header from './Header';
import ChatView from './ChatView';
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';
import './main.css'
function DisplayChatsPage() {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found');
      return null;
    }
    const decodedToken = jwtDecode(authToken);
    return decodedToken.username;
  };

  const fetchUserInfoById = async (userId) => {
    try {
      const response = await fetch(`/api/userInfoById/${userId}`);
      const data = await response.json();
      return data.userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return {};
    }
  };

  useEffect(() => {
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
        
        const updatedChats = await Promise.all(data.conversations.map(async (chat) => {
          const updatedParticipants = await Promise.all(chat.participants.map(async (participant) => {
          
            const userInfo = await fetchUserInfoById(participant);
            if (userInfo.username !== username){
              return { id: participant, name: userInfo.username, image: userInfo.profileImage };
            }
            return null; // Return null for current user
          }));
          return { ...chat, participants: updatedParticipants.filter(Boolean) }; // Remove null values
        }));
        
        setChats(updatedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchData();
  }, []);

  const handleChatSelection = (chatId) => {
    setSelectedChat(prevSelectedChat => (prevSelectedChat === chatId ? null : chatId));
  };

  return (
    <div>
      <Header />
      <div className="title-container">
        <h2>{t('conversations')}</h2>
        <div className="chat-container">
          <div className="matches-list">
            {chats.length > 0 ? (
              chats.map(chat => (
                <div key={chat._id} className={`match ${selectedChat === chat._id ? 'selected' : ''}`} onClick={() => handleChatSelection(chat._id)}>
                  {chat.participants.map(participant => (
                    <div key={participant.id}>
                      <div className="participant-container">
                        <img className="chat-image" src={participant.image} alt={participant.name} />
                        <h3>{participant.name} </h3>
                      </div>
                    </div>
                  ))}
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
