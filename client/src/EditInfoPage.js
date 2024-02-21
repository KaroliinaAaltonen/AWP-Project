import React, { useState, useEffect } from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

function EditInfoPage() {
  const [userInfo, setUserInfo] = useState('');
  const [image, setImage] = useState(null);
  const [existingUserInfo, setExistingUserInfo] = useState('');

  const handleUserInfoChange = (event) => {
    setUserInfo(event.target.value);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('userInfo', userInfo);
    formData.append('image', image);

    try {
      const response = await fetch('/api/updateUserInfo', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      // Handle response as needed
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
