import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      // Redirect to login page after successful registration
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container mt-5" id="register-page-container">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Register a New User</h1>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
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
                  <label htmlFor="password">Password:</label>
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
                  <button type="submit" className="btn btn-primary" id="registration-view-btn">Register</button>
                </div>
                {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default RegistrationPage;
