import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './main.css';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode


const AdminPage = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate(); // Initialize the navigate function
  const [userProfiles, setUserProfiles] = useState([]); // State variable for user profiles
  const [expandedProfile, setExpandedProfile] = useState(null); // State variable for expanded profile
  const [matches, setMatches] = useState([]); // State variable for matches
  const [chatLogs, setChatLogs] = useState([]); // State variable for chat logs
  const [conversations, setConversations] = useState([]); // State variable for conversations
  const [selectedConversation, setSelectedConversation] = useState(null); // State variable for selected conversation
  const expandedRef = useRef(); // Ref for expanded info div
  
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
    if (!authToken) {
      console.error('Authentication token not found'); // Log error if authentication token is not found
      return null;
    }
    const decodedToken = jwtDecode(authToken); // Decode JWT token
    return decodedToken.username; // Return the username extracted from the token
  };

  useEffect(() => {
    const username = usernameFromToken(); // Get username from token
    if (username !== 'Admin') {
      // Redirect to "*" route if username is not "Admin"
      navigate('*');
    } else {
      // Fetch user profiles data from the server
      fetch('/api/admin/profiles')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => setUserProfiles(data.userProfiles)) // Set user profiles state
        .catch(error => console.error('Error fetching user profiles:', error));
    }
  }, []);

  const handleItemClick = async (username, event) => {
    try {
      if (expandedProfile === username) {
        if (!event.target.closest('.expanded-info')) {
          // Close expanded profile if clicked outside
          setExpandedProfile(null);
          setMatches([]);
          setChatLogs([]);
          if (selectedConversation !== null) {
            setSelectedConversation(null);
          }
        }
      } else {
        // Open expanded profile
        setExpandedProfile(username);

        // Fetch user data for matches and conversations
        const response = await fetch(`/api/admin/user-data/${username}`);
        const data = await response.json();

        // Extract match usernames
        const matchUsernames = await Promise.all(
          data.matches.map(async (match) => {
            const user = await fetch(`/api/userInfoById/${match.likedUser}`);
            const userData = await user.json();
            return userData.userInfo.username;
          })
        );
        setMatches(matchUsernames); // Set matches state

        // Fetch conversations data
        const conversationsData = await Promise.all(
          data.matches.map(async (match) => {
            const conversationResponse = await fetch(`/api/conversations/${username}`);
            const conversationData = await conversationResponse.json();
            return conversationData.conversations;
          })
        );
        setConversations(conversationsData.flat()); // Set conversations state
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleConversationClick = async (conversationId) => {
    try {
      if (selectedConversation === conversationId) {
        // Close selected conversation
        setSelectedConversation(null);
        setChatLogs([]);
      } else {
        // Open selected conversation and fetch messages
        setSelectedConversation(conversationId);
        const messageResponse = await fetch(`/api/conversations/${conversationId}/get-messages`);
        const messageData = await messageResponse.json();
        setChatLogs(messageData.messages); // Set chat logs state
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const handleDeleteUser = async (username) => {
    // Confirm the deletion
    const confirmDelete = window.confirm(`${t('confirm delete')} ${username}?`);
    if (confirmDelete) {
      try {
        // Delete user
        const response = await fetch(`/api/admin/users/${username}`, {
          method: 'DELETE'
        });
        const data = await response.json();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`${t('delete error')}`); // Display error message
      }
    }
  };

  const handleEditUser = async (username) => {
    // Navigate to the edit user page with the username as a parameter
    navigate(`/admin/edit-user/${username}`);
  };

  // Function to handle logout
  const handleLogout = () => {
    navigate('/'); // Navigate to the root route when logout button is clicked
  };

  return (
    <div className="admin-page">
      {/* Logout button */}
      <button onClick={handleLogout} className="admin-logout-button">{t('log out')}</button>
      <div className="admin-header">
        <h1>{t('admin view')}</h1>
      </div>
      <ul className="profile-list">
        {/* Render user profiles */}
        {userProfiles.map((profile, index) => (
          <li key={index} className="profile-item" onClick={(event) => handleItemClick(profile.username, event)}>
            <strong>{profile.username}</strong>
            {expandedProfile === profile.username && (
              <div className="expanded-info" ref={expandedRef}>
                {/* Render expanded profile information */}
                {profile.profileImage && (
                  <img src={profile.profileImage} alt="Profile" className="profile-image" />
                )}
                <p className="user-info">User Info: {profile.userInfo}</p>
                {/* Delete and edit buttons */}
                <button className="admin-delete-user-button" onClick={() => handleDeleteUser(profile.username)}>{t('delete user')}</button>
                <button className="admin-edit-user-button" onClick={() => handleEditUser(profile.username)}>{t('edit user')}</button>
                <h2>{t('matches')}</h2>
                <ul>
                  {/* Render matches */}
                  {matches.map((match, index) => (
                    <li key={index}>{match}</li>
                  ))}
                </ul>
                <h2>{t('chats')}</h2>
                <ul className="conversation-list">
                  {/* Render conversations */}
                  {conversations.map((conversation, index) => (
                    <li key={index} className="profile-item" onClick={(event) => handleConversationClick(conversation._id, event)}>
                      <strong>{conversation.participants.join(' & ')}:</strong>
                    </li>
                  ))}
                </ul>
                {/* Render chat logs for selected conversation */}
                {selectedConversation && (
                  <div>
                    <ul className="chat-logs">
                      {chatLogs.map((message, index) => (
                        <li key={index} className="chat-message">
                          <strong>{message.sender}:</strong> {message.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
