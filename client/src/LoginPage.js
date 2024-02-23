// client/src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for navigation
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t, i18n } = useTranslation(); // Initialize translation hooks
  const [username, setUsername] = useState(''); // State variable for username
  const [password, setPassword] = useState(''); // State variable for password
  const [errorMessage, setErrorMessage] = useState(''); // State variable for error message
  const navigate = useNavigate(); // Using useNavigate hook for navigation

  // Function to handle registration
  const handleRegister = async (event) => {
    event.preventDefault();
    navigate('/register'); // Navigate to the register page
  };

  // Function to handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    
    try {
      // Sending login request to the server
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in'); // Throw error if login fails
      }
      
      // Check if login was successful
      if (data.message === 'Login successful') {
        // Store authentication token in local storage
        localStorage.setItem('authToken', data.token);
        
        // Redirect to main page
        navigate('/main');
      } else {
        // Handle other cases, if any
      }
    } catch (error) {
      setErrorMessage(error.message); // Set error message if login fails
    }
  };

  // Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="container" id="login-page-container">
      <div className="col-md-8">
        <div className="card">
          {/* Language dropdown */}
          <div className="dropdown d-inline-block ml-2" id="lang-dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              {t('language')}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><button className="dropdown-item" onClick={() => changeLanguage('en')}>English</button></li>
              <li><button className="dropdown-item" onClick={() => changeLanguage('sv')}>Svenska</button></li>
              <li><button className="dropdown-item" onClick={() => changeLanguage('fi')}>Finnish</button></li>
            </ul>
          </div>
          <div className="card-body">
            <h1 className="card-title text-center">{t('login')}</h1>
            <form>
              {/* Username input */}
              <div className="form-group">
                <label htmlFor="username">{t('username')}</label>
                <input 
                  id="username" 
                  name="username" 
                  className="form-control" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
              {/* Password input */}
              <div className="form-group">
                <label htmlFor="password">{t('password')}</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              {/* Login and register buttons */}
              <div className="text-center">
                <button 
                  type="button" 
                  className="btn btn-primary mr-2" 
                  onClick={handleLogin}
                  id="login-btn"
                >
                  {t('login')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleRegister}
                  id="register-btn"
                >
                  {t('register')}
                </button>
              </div>
              {/* Error message display */}
              {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
