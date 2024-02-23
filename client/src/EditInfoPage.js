import React, { useState, useEffect } from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import { jwtDecode } from "jwt-decode";
import tempImg from './images/temp.png'; // temporary image if there is no profile picture

function EditInfoPage() {
  const [userInfo, setUserInfo] = useState('');
  const [image, setImage] = useState(null);
  const [existingUserInfo, setExistingUserInfo] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleUserInfoChange = (event) => {
    setUserInfo(event.target.value);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    // Reset the form
    document.getElementById("image-form").reset();
    // Reset the state variables
    setUserInfo('');
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Get the username from JWT token
    const username = usernameFromToken();
    if (!username) return;
  
    // Create FormData object to send form data including the image file
    const formData = new FormData();
    formData.append('userInfo', userInfo);
    formData.append('image', image); // Append the image file to the FormData object
    formData.append('username', username);
  
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/updateUserInfo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
  
      // If the update was successful, fetch the updated user info and update the state
      if (response.ok) {
        const updatedUserInfo = await getUserInfoByUsername(username);
        if (updatedUserInfo && updatedUserInfo.profileImage) {
          setExistingUserInfo(updatedUserInfo);
        }
  
        // Reset the form
        event.target.reset();
        // Reset the state variables
        setUserInfo('');
        setImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const username = usernameFromToken();
        if (!username) return;

        const userInfo = await getUserInfoByUsername(username);
        if (userInfo && userInfo.profileImage) {
          console.log(userInfo.profileImage);
          setExistingUserInfo(userInfo);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchUserInfo();
  }, []);
  
  const getUserInfoByUsername = async (username) => {
    try {
      const response = await fetch(`/api/userInfo/${username}`);
      const data = await response.json();
      return data.userInfo;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  return (
    <div className="edit-info-page">
      <Header />
      {existingUserInfo && (
        <div className="existing-user-info">
          <h3>Edit your information</h3>
          <p>Username: {existingUserInfo.username}</p>
          <p>Information: {existingUserInfo.userInfo}</p>
          <div className="profile-image">
            {existingUserInfo.profileImage ? (
              <img src={existingUserInfo.profileImage} alt="Profile Image" />
            ) : (
              <img src={tempImg} alt="Temporary Image" />
            )}
          </div>
        </div>
      )}
      <form id="image-form" onSubmit={handleSubmit} onReset={handleReset}>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected Image" />
          </div>
        )}
        <div className="form-group" id="info-text-field">
          <label htmlFor="userInfo">New user Info:</label>
          <textarea id="userInfo" className="form-control" name="userInfo" value={userInfo} onChange={handleUserInfoChange} maxLength={150} />
        </div>
        <div className="form-group" id="upload-image-div">
          <label htmlFor="image" id="upload-image-label">Upload Image:</label>
          <input type="file" id="image" className="form-control-file" name="image" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary" id="edit-info-save-button">Save</button>
          <button type="button" className="btn btn-secondary" id="cancel-button" onClick={handleReset}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditInfoPage;
