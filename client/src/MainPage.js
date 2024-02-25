import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import { jwtDecode } from "jwt-decode";
import './main.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import rest from './images/rest.jpg';

function MainPage() {
  const { t } = useTranslation(); // i18n
  // set states
  const [randomUser, setRandomUser] = useState(null);
  const [showMatchText, setShowMatchText] = useState(false);
  const [matchUsers, setMatchUsers] = useState({});
  const [exhaustedSkinder, setExhaustedSkinder] = useState(false); // State for indicating if Skinder is exhausted

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

  // Functions to get random user from the back-end database
  // And set the suggested profile to a user that is not the current authenticated user
  const fetchRandomUser = useCallback(async (currentUser) => {
    try {
      const username = usernameFromToken();
      if (!username) return;
  
      const userInfo = await getRandomUser(username, currentUser);
      if (userInfo && userInfo.profileImage) {
        console.log(userInfo.profileImage);
        setRandomUser(userInfo);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const getRandomUser = async (username, currentUser) => {
    try {
      const response = await fetch(`/api/randomUser/${username}`);
      const data = await response.json();
      // Check if Skinder is exhausted
      if (response.status === 404 && data.message === 'rest') {
        setExhaustedSkinder(true);
        return;
      }
      if (data.userInfo.username !== currentUser) {
        return data.userInfo;
      } else {
        return getRandomUser(username, currentUser);
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // When user is liked, it is written to the database in the back-end
  // If the liked user had already liked the current authenticated user a match is alerted
  const handleLike = async () => {
    if (randomUser) {
      const authToken = localStorage.getItem('authToken');
      const currentUser = usernameFromToken();
      try {
        const response = await fetch(`/api/like/${randomUser._id}/${currentUser}`, {
          method: 'POST'
        });
        const data = await response.json();
        fetchRandomUser(randomUser.username);
        if (data.match) {
          setShowMatchText(true);
          setMatchUsers({ currentUser, likedUser: randomUser });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Dislike doesn't do anything other than show next random profile
  const handleDislike = () => {
    if (randomUser) {
      fetchRandomUser(randomUser.username);
    }
  };
 // After match is alerted the user can send a message to them or keep scrolling
 // On keep scrolling click the match alert view is just closed
  const handleKeepScrolling = () => {
    setShowMatchText(false);
    setMatchUsers({});
  };

  useEffect(() => {
    fetchRandomUser();
  }, [fetchRandomUser]);

  // Get current authenticated user object so that their image can be set on match
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const username = usernameFromToken();
        const response = await fetch(`/api/userInfo/${username}`);
        const data = await response.json();
        setMatchUsers(prevState => ({ ...prevState, currentUser: data.userInfo }));
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
  
    if (showMatchText) {
      fetchCurrentUser();
    }
  }, [showMatchText]);

  return (
    <div>
      {/* Render the Header component */}
      <Header />
  
      {/* Render the container for user-related content */}
      <div className="main-user-container">
        {exhaustedSkinder ? ( // Conditional rendering for exhausted Skinder in there are no unliked users
          <div className="exhausted-skinder-container">
            <p className="exhausted-skinder-text">{t('NB')}</p>
            <img src={rest} alt="Exhausted Skinder" className="thanos" />
          </div>
        ) : randomUser && (
          <div className="main-user-card">
            {/* Display user profile image */}
            <Link to={`/profile/${randomUser.username}`}>
              <img src={randomUser.profileImage} alt="User" className="main-user-image" />
            </Link>
            
            {/* Display user name */}
            <Link to={`/profile/${randomUser.username}`} className="main-user-name">
              {randomUser.username}
            </Link>
            
            {/* Display user info */}
            <p className="main-user-info">{randomUser.userInfo}</p>
            
            {/* Button group for user actions */}
            <div className="main-button-group">
              {/* Button to like user */}
              <button onClick={handleLike} className="main-like-button">{t('like')}</button>
              
              {/* Button to dislike user */}
              <button onClick={handleDislike} className="main-dislike-button">{t('dislike')}</button>
            </div>
          </div>
        )}
      </div>
  
      {/* Display match overlay if showMatchText is true */}
      {showMatchText && (
        <div className="match-overlay">
          {/* Display matched users' profile images */}
          <div className="match-images">
            <img src={matchUsers.currentUser.profileImage} alt="Current User" className="match-image" />
            <img src={matchUsers.likedUser.profileImage} alt="Liked User" className="match-image" />
          </div>
          
          {/* Display match text and buttons */}
          <div className="match-text">
            <h2>{t('match alert')}</h2>
            <div className="match-button-group">
              {/* Button to keep scrolling */}
              <button onClick={handleKeepScrolling}>{t('keep scrolling')}</button>
              
              {/* Button to message matched user */}
              <a href="/chats"><button>{t('message them')}</button></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  

export default MainPage;
