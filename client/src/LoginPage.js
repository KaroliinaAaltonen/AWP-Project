import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Using useNavigate hook

  const handleRegister = async (event) => {
    event.preventDefault();
    navigate('/register');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
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
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container" id="login-page-container">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center">Login</h1>
              <form>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input 
                    id="username" 
                    name="username" 
                    className="form-control" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-primary mr-2" 
                    onClick={handleLogin}
                    id="login-btn"
                  >
                    Log in
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleRegister}
                    id="register-btn"
                  >
                    Register
                  </button>
                </div>
                {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default LoginPage;
