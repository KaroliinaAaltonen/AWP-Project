import React, { useEffect, useState } from 'react';
import Header from './Header';
import axios from 'axios';

function DisplayChatsPage() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Fetch chats from backend
    axios.get('/api/chats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(response => {
      setChats(response.data.chats);
    })
    .catch(error => {
      console.error('Error fetching chats:', error);
    });
  }, []);

  return (
    <div>
      <Header />
      <h2>DISPLAY CHATS</h2>
      <div>
        {chats.map(chat => (
          <div key={chat._id}>
            <h3>{chat.otherUser}</h3>
            <ul>
              {chat.messages.map(message => (
                <li key={message._id}>
                  <strong>{message.sender}: </strong>{message.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayChatsPage;
