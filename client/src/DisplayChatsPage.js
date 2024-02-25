import React, { useEffect, useState } from 'react';
import Header from './Header'; // Importing Header component for the page header
import ChatView from './ChatView'; // Importing ChatView component for displaying chat messages
import { jwtDecode } from "jwt-decode"; // Importing jwtDecode library for decoding JWT tokens
import { useTranslation } from 'react-i18next'; // Importing useTranslation hook for internationalization
import './main.css'; // Importing CSS file for styling

function DisplayChatsPage() {
  const { t } = useTranslation(); // Initializing translation hook
  const [chats, setChats] = useState([]); // State variable for storing chat conversations
  const [currentUser, setCurrentUser] = useState(''); // State variable for storing the current user's username
  const [selectedChat, setSelectedChat] = useState(null); // State variable for tracking the selected chat conversation
  const [searchKeyword, setSearchKeyword] = useState(''); // State variable for storing the search keyword
  // State variables for pagination
  const [page, setPage] = useState(1);
  const chatsPerPage = 10;
  const pagerElements = []; // Array to hold pagination controls JSX elements
  let activeIndex = 0; // Variable to track the active page index

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

  // Function to fetch user information by user ID
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

  // Effect hook to fetch chat conversations and user information when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = usernameFromToken();
        setCurrentUser(username); // Set the current user's username
        const response = await fetch(`/api/conversations/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        
        // Update chat conversations with participant information
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
        
        setChats(updatedChats); // Update the chat conversations state
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchData();
  }, []);

  // Function to handle selection of a chat conversation
  const handleChatSelection = (chatId) => {
    setSelectedChat(prevSelectedChat => (prevSelectedChat === chatId ? null : chatId)); // Toggle selected chat
  };

  // Function to handle pagination
  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

// Render pagination controls
const renderPagination = () => {
  const pageCount = Math.ceil(chats.length / chatsPerPage);
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="pagination">
      {pageNumbers.map((number) => (
        <button
          key={number}
          className={`pagination-button ${page === number ? 'active' : ''}`}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </button>
      ))}
    </div>
  );
};
  
  // Render chat conversations based on pagination
  const renderChats = () => {
    const startIndex = (page - 1) * chatsPerPage;
    const endIndex = startIndex + chatsPerPage;
    const visibleChats = chats.slice(startIndex, endIndex);
    return (
      <>
        {visibleChats.map((chat) => (
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
        ))}
      </>
    );
  };
  
  return (
    <div>
      <Header />
      <div className="title-container">
        <h2>{t('conversations')}</h2>
        <div className="search-bar">
          <input
            className="dcp-search-bar"
            type="text"
            placeholder="Search messages"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className="chat-container">
          {/* list of conversations (matches) on the left */}
          <div className="matches-list">
            {chats.length > 0 ? renderChats() : <p>{t('no matches')}</p>}
          </div>
          <div className="chat-view">
            {/*  chat view opens on the right side when the conversation is clicked */}
            {selectedChat && <ChatView chatId={selectedChat} isOpen={true} sender={currentUser} searchKeyword={searchKeyword} />}
          </div>
        </div>
      </div>
      {/* Add pagination inside pager-container */}
      <div className="pager-container">
        {renderPagination()}
      </div>
    </div>
  );  
}

export default DisplayChatsPage;
