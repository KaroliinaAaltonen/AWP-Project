// client/src/EditInfoPage.js
import React, { useState, useEffect } from 'react'; // Import features from react
import Header from './Header'; // Import the Header component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './main.css'; // Import custom CSS
import { jwtDecode } from "jwt-decode"; // Import jwt-decode for decoding JWT tokens
import tempImg from './images/temp.png'; // Import temporary image if there is no profile picture
import { useTranslation } from 'react-i18next'; // Import translation hook

function EditInfoPage() {
  const { t } = useTranslation(); // Initialize translation hook
  const [userInfo, setUserInfo] = useState(''); // State variable for user information
  const [image, setImage] = useState(null); // State variable for image file
  const [existingUserInfo, setExistingUserInfo] = useState(''); // State variable for existing user information
  const [imagePreview, setImagePreview] = useState(null); // State variable for image preview

  // Function to extract username from JWT token
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
    if (!authToken) {
      console.error('Authentication token not found'); // Log error if authentication token is not found
      return null;
    }
    const decodedToken = jwtDecode(authToken); // Decode JWT token
    return decodedToken.username; // Return the username extracted from the token
  };

  const handleUserInfoChange = (event) => {
    setUserInfo(event.target.value); // Update user information state with the entered value
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded image file
    setImage(file); // Update image state with the uploaded file

    // Display image preview
    const reader = new FileReader(); // Create FileReader object
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set image preview state with the result of reading the file
    };
    reader.readAsDataURL(file); // Read the uploaded file as a data URL
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
    event.preventDefault(); // Prevent the default form submission behavior
  
    // Get the username from JWT token
    const username = usernameFromToken();
    if (!username) return;
  
    // Create FormData object to send form data including the image file
    const formData = new FormData();
    formData.append('userInfo', userInfo); // Append user information to the FormData object
    formData.append('image', image); // Append the image file to the FormData object
    formData.append('username', username); // Append the username to the FormData object
  
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
  }, []); // Run this effect once when the component mounts
  
  // Function to fetch user information by username
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
      <Header /> {/* Render the Header component */}
      {existingUserInfo && (
        <div className="existing-user-info">
          <h3>{t('edit info')}</h3>
          <p>{t('username')}: {existingUserInfo.username}</p>
          <p>{t('information')}: {existingUserInfo.userInfo}</p>
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
          <label htmlFor="userInfo">{t('new info')}:</label>
          <textarea id="userInfo" className="form-control" name="userInfo" value={userInfo} onChange={handleUserInfoChange} maxLength={150} />
        </div>
        <div className="form-group" id="upload-image-div">
          <label htmlFor="image" id="upload-image-label">{t('upload image')}</label>
          <input type="file" id="image" className="form-control-file" name="image" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary" id="edit-info-save-button">{t('save')}</button>
          <button type="button" className="btn btn-secondary" id="cancel-button" onClick={handleReset}>{t('cancel')}</button>
        </div>
      </form>
    </div>
  );
}

export default EditInfoPage;
