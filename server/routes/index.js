const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define a secret key for JWT
const secretKey = 'your-secret-key';

// user-object in the database has a unique name and a password
const usersSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  profileImage: { type: String },
  userInfo: { type: String }
});

const User = mongoose.model('User', usersSchema);

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

    // Send a JSON response indicating successful login
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user info
router.post('/api/updateUserInfo', async function(req, res) {
  try {
    const { userInfo, image } = req.body;
    const userId = req.user.id; // Assuming you have user ID available after authentication
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userInfo) {
      user.userInfo = userInfo;
    }

    if (image) {
      // Logic to save the image file
      // Set the profile image path to the user object
      user.profileImage = image.path; // Change this according to your file storage setup
    }

    await user.save();

    res.status(200).json({ message: 'User info updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
