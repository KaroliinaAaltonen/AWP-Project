import React, { useState, useEffect } from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import { jwtDecode } from "jwt-decode";

function EditInfoPage() {
  const [userInfo, setUserInfo] = useState('');
  const [image, setImage] = useState(null);
  const [existingUserInfo, setExistingUserInfo] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found');
      return;
    }

    // Decode the JWT token to extract the username
    const decodedToken = jwtDecode(authToken);
    const { username } = decodedToken;

    // Create FormData object to send form data including the image file
    const formData = new FormData();
    formData.append('userInfo', userInfo);
    formData.append('image', image); // Append the image file to the FormData object
    formData.append('username', username);

    try {
      console.log(authToken);
      console.log(formData.get('userInfo')); // Log the FormData object to ensure it includes the image file
      console.log(formData.get('image'));
      console.log(formData.get('username'));
      const response = await fetch('/api/updateUserInfo', {
        method: 'POST',
        body: formData, // Send FormData instead of JSON.stringify(updatedData)
        headers: {
          // Remove 'Content-Type' header to let browser set it automatically
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setExistingUserInfo(data.userInfo);
    } catch (error) {
      console.error('Error:', error);
    }
};

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/userInfo');
        const data = await response.json();
        setExistingUserInfo(data.userInfo);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <div className="edit-info-page">
      <Header />
      <div className="existing-user-info">
        <h3>Edit your information</h3>
        <p>{existingUserInfo}</p>
      </div>
      <form onSubmit={handleSubmit}>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected Image" />
          </div>
        )}
        <div className="form-group" id="info-text-field">
          <label htmlFor="userInfo">User Info:</label>
          <textarea id="userInfo" className="form-control" name="userInfo" value={userInfo} onChange={handleUserInfoChange} maxLength={150} />
        </div>
        <div className="form-group" id="upload-image-div">
          <label htmlFor="image" id="upload-image-label">Upload Image:</label>
          <input type="file" id="image" className="form-control-file" name="image" accept="image/*" onChange={handleImageUpload} />
        </div>
        <button type="submit" className="btn btn-primary" id="edit-info-save-button">Save</button>
      </form>
    </div>
  );
}

export default EditInfoPage;
