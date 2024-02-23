// Inside MainPage component
import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header';
import { jwtDecode } from "jwt-decode";
import './main.css'; // Import CSS file for styling

function MainPage() {
  const [randomUser, setRandomUser] = useState(null);
  const [showMatchText, setShowMatchText] = useState(false);
  const [matchUsers, setMatchUsers] = useState({});

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

  const handleDislike = () => {
    if (randomUser) {
      fetchRandomUser(randomUser.username);
    }
  };

  const handleKeepScrolling = () => {
    setShowMatchText(false);
    setMatchUsers({});
  };

  useEffect(() => {
    fetchRandomUser();
  }, [fetchRandomUser]);

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
      <Header />
      <div className="user-container">
        {randomUser && (
          <div className="user-card">
            <img src={randomUser.profileImage} alt="User" className="user-image" />
            <h3 className="user-name">{randomUser.username}</h3>
            <p className="user-info">{randomUser.userInfo}</p>
            <div className="button-group">
              <button onClick={handleLike} className="like-button">Like</button>
              <button onClick={handleDislike} className="dislike-button">Dislike</button>
            </div>
          </div>
        )}
      </div>
      {showMatchText && (
        <div className="match-overlay">
          <div className="match-images">
            <img src={matchUsers.currentUser.profileImage} alt="Current User" className="match-image" />
            <img src={matchUsers.likedUser.profileImage} alt="Liked User" className="match-image" />
          </div>
          <div className="match-text">
            <h2>OMG THIS IS A MATCH</h2>
            <div className="button-group">
              <button onClick={handleKeepScrolling}>Keep Scrolling</button>
              <a href="/chats"><button>Message Them</button></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
