import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Header from './Header';

function MainPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      // Decode the JWT token to extract the username
      const decodedToken = jwtDecode(authToken);
      const { username } = decodedToken;
      setUsername(username);
    }
  }, [navigate]);

  const handleOptionSelect = (path) => {
    navigate(path);
  };

  return (
    <div>
      <Header username={username} handleOptionSelect={handleOptionSelect} />
    </div>
  );
}

export default MainPage;
