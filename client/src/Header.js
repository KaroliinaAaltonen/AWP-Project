// client/src/Header.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './main.css';
import { jwtDecode } from "jwt-decode"; // Import jwtDecode from jwt-decode library
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation(); // Initialize translation hooks
  const [username, setUsername] = useState(''); // State variable for username

  useEffect(() => {
    // Retrieve the authentication token from local storage
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Decode the JWT token to extract the username
      const decodedToken = jwtDecode(authToken);
      const { username } = decodedToken;
      setUsername(username); // Set the username in state
    }
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Function to change language using i18n hook
  };

  return (
    <div className="header-container">
      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Brand link with conditional display based on username */}
          <Link className="navbar-brand" to="/main">
            {username ? `${t('skinder for')} ${username}` : 'Skinder'}
          </Link>
          {/* Navbar toggler for responsive design */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {/* Navbar collapse content */}
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            {/* Navbar items list */}
            <ul className="navbar-nav">
              {/* Edit info link */}
              <li className="nav-item">
                <Link className="nav-link" to="/editinfo">{t('edit info')}</Link>
              </li>
              {/* Display chats link */}
              <li className="nav-item">
                <Link className="nav-link" to="/chats">{t('display chats')}</Link>
              </li>
              {/* Log out link */}
              <li className="nav-item">
                <Link className="nav-link" to="/">{t('log out')}</Link>
              </li>
              {/* Language dropdown */}
              <li className="nav-item">
                <div className="dropdown">
                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    {t('language')}
                  </button>
                  {/* Dropdown menu for language selection */}
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {/* English language option */}
                    <li><button className="dropdown-item" onClick={() => changeLanguage('en')}>English</button></li>
                    {/* Swedish language option */}
                    <li><button className="dropdown-item" onClick={() => changeLanguage('sv')}>Svenska</button></li>
                    {/* Finnish language option */}
                    <li><button className="dropdown-item" onClick={() => changeLanguage('fi')}>Finnish</button></li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
