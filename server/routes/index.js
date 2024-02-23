const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs'); // file system module for dealing with the images
const path = require('path'); // for working with file and directory paths
const formidable = require('express-formidable'); // express-formidable for handling FormData()
const router = express.Router(); // app
const secretKey = 'your-secret-key'; // Define a secret key for JWT

// Serve static files from the 'uploads' directory
router.use('/api/profileImage', express.static(path.join(__dirname, 'uploads')));

// user-object in the database has a unique name and a password
const usersSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  profileImage: { type: String },
  userInfo: { type: String }
});

const User = mongoose.model('User', usersSchema);

// Route to get user information by username
router.get('/api/userInfo/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user information including the profile image URL
    res.status(200).json({ userInfo: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Register a new user
router.post('/api/register', async function(req, res) {
  try {
    const { username, password } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with hashed password
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Send a JSON response indicating successful registration
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/api/login', async function(req, res) {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // If username and password are correct, generate a JWT token
    const token = jwt.sign({ username }, secretKey);

    // Send a JSON response with the token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to handle updating user info
router.post('/api/updateUserInfo', formidable(), async (req, res) => {
  try {
    // Extract fields from the request
    const { userInfo, username } = req.fields;
    const image = req.files.image;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user information
    user.userInfo = userInfo;

    // Check if an image was uploaded
    if (image) {

      if (user.profileImage) {
        // If the user already has an image, delete the old one
        deleteImageFromStorage(user.profileImage);
      }
      // Save the new image to storage using the original filename
      const newImagePath = await saveImageToStorage(image.path, image.name);

      // Update user's profile image with the new image URL
      user.profileImage = `/api/profileImage/${image.name}`;
    }

    // Save the updated user object
    await user.save();

    res.status(200).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function deleteImageFromStorage(imagePath) {
  try {
    // Check if the file exists
    if (fs.existsSync(imagePath)) {
      // Delete the file
      fs.unlinkSync(imagePath);
      console.log(`Deleted ${imagePath}`);
    } else {
      console.log(`File not found: ${imagePath}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

async function saveImageToStorage(imagePath, originalFileName) {
  try {
    // Define the directory where uploaded files will be stored
    const uploadDir = path.join(__dirname, 'uploads');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Construct the path for the uploaded image using the original filename
    const newImagePath = path.join(uploadDir, originalFileName);

    // Move the image file to the uploads directory with the original filename
    fs.renameSync(imagePath, newImagePath);

    // Return the path where the image is saved
    return newImagePath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error; // Rethrow the error to handle it outside
  }
}
module.exports = router