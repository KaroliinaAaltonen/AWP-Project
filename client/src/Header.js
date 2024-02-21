import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css'; // Import your CSS file
import { jwtDecode } from "jwt-decode";

function Header() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve the authentication token from local storage
    const authToken = localStorage.getItem('authToken');
    console.log(authToken);
    if (authToken) {
      // Decode the JWT token to extract the username
      const decodedToken = jwtDecode(authToken);
      const { username } = decodedToken;
      setUsername(username);
    }
  }, []);

  return (
    <div className="header-container">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Display "Skinder for username" if username is available */}
          <Link className="navbar-brand" to="/main">
            {username ? `Skinder for ${username}` : 'Skinder'}
          </Link>
          <div className="collapse navbar-collapse justify-content-end">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/editinfo">Edit Your Info</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/chats">Display Chats</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">Log Out</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
