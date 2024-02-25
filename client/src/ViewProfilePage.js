import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';

function ViewProfilePage() {
  const { t } = useTranslation(); // Initialize translation hook
  const { username } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show the profile that was clicked on MainPage.js
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/userInfo/${username}`);
        const data = await response.json();
        console.log(data);
        setUserInfo(data.userInfo);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [username]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (!userInfo) {
    return <div>{t('user not found')}</div>;
  }

  return (
    <div>
       <Header /> 
      <div className="view-profile-container">
        {/* Show profile info */}
        <div className="view-profile-image">
          <img src={userInfo.profileImage} alt="Profile" />
        </div>
        <div className="view-profile-details">
          <h2>{userInfo.username}</h2>
          <p>{userInfo.userInfo}</p>
          <p>{t('member since')}: {new Date(userInfo.createdAt).toLocaleDateString()}</p> {/* Display the createdAt date */}
        </div>
      </div>
    </div>
  );
}

export default ViewProfilePage;
