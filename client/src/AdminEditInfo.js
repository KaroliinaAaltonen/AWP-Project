import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './main.css';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const AdminEditInfo = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const navigate = useNavigate(); // Initialize the navigate function
  const { username } = useParams();
  const [userInfo, setUserInfo] = useState({}); // State variable for user information
  const [image, setImage] = useState(null); // State variable for selected image file
  const [imagePreview, setImagePreview] = useState(null); // State variable for image preview
  
  const usernameFromToken = () => {
    const authToken = localStorage.getItem('authToken'); // Retrieve authentication token from local storage
    if (!authToken) {
      console.error('Authentication token not found'); // Log error if authentication token is not found
      return null;
    }
    const decodedToken = jwtDecode(authToken); // Decode JWT token
    return decodedToken.username; // Return the username extracted from the token
  };
  useEffect(() => {
    const authenticated = usernameFromToken(); // Get username from token
    if (authenticated !== 'Admin') {
      // Redirect to "*" route if username is not "Admin"
      navigate('*');
    } else {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/userInfo/${username}`);
        const data = await response.json();
        setUserInfo(data.userInfo); // Set user information state
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
    }
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('userInfo', userInfo.userInfo); // Append user information to FormData
      formData.append('username', username); // Append username to FormData
  
      // Append the image to FormData only if a new image is selected
      if (image) {
        formData.append('image', image);
      }
  
      const response = await fetch(`/api/admin/edit-user/${username}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      alert(data.message); // Display success message
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('An error occurred while updating user info.'); // Display error message
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set image preview state
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    navigate('/admin'); // Redirect to /admin route
  };

  return (
    <div className="admin-edit-info-page">
      {/*The view is similar to the user's version of edit info page (defined in EditInfoPage.js)*/}
      <h1>{t('edit info')}</h1>
      {userInfo.profileImage && (
          <div className="profile-image">
            <img src={userInfo.profileImage} alt="Profile Image" />
          </div>
        )}
        {/* Form for submitting new information and image*/}
      <form onSubmit={handleSubmit}>
        <div className="form-group-admin-username">
          <label>{t('username')}:</label>
          <input type="text" value={userInfo.username || ''} readOnly />
        </div>
        <div className="form-group-admin-userinfo">
          <label>{t('user info')}:</label>
          <textarea name="userInfo" value={userInfo.userInfo || ''} onChange={handleChange} />
        </div>
        <div className="form-group-admin-image">
          <label>{t('profile image')}:</label>
          <input type="file" name="profileImage" onChange={handleImageUpload} accept="image/*" />
        </div>
        {/* Previewing the selected image*/}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Image Preview" />
          </div>
        )}
        {/* Save button */}
        <button type="submit">{t('save changes')}</button>
      </form>
      <button class="admin-back-button" onClick={handleBack}>{t('back')}</button> {/* Back button */}
    </div>
  );
};

export default AdminEditInfo;
