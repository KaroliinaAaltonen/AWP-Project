// client/src/RegistrationPage.js
import React, { useState } from 'react'; // Import features from React
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from react-router-dom
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { useTranslation } from 'react-i18next'; // Import useTranslation hook from react-i18next

function RegistrationPage() {
  const { t } = useTranslation(); // Initialize translation hook
  const [username, setUsername] = useState(''); // State variable for username
  const [password, setPassword] = useState(''); // State variable for password
  const [errorMessage, setErrorMessage] = useState(''); // State variable for error message
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleRegister = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }) // Send username and password in JSON format
      });
      const data = await response.json(); // Parse response data
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register'); // Throw an error if registration fails
      }
      // Redirect to login page after successful registration
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message); // Set error message state if an error occurs
    }
  };

  return (
    <div className="container mt-5" id="register-page-container">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">{t('register new user')}</h1>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="username">{t('username')}:</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    className="form-control" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">{t('password')}:</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary" id="registration-view-btn">{t('register')}</button>
                </div>
                {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>} {/* Display error message if exists */}
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default RegistrationPage;
