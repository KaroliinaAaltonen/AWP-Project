const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');

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

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  }
});

// Middleware to handle file uploads
const upload = multer({ storage: storage });

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token not provided' });
  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
    
    req.user = decoded;
    next();
  });
};

// Route to get user information
router.get('/api/userInfo', verifyToken, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ userInfo: user.userInfo });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to handle file upload
router.post('/api/uploadImage', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user ID available after authentication
    const imagePath = req.file.path;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile image path in the database
    user.profileImage = imagePath;
    await user.save();

    res.status(200).json({ message: 'Image uploaded successfully' });
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

// Update user info
// Route to handle updating user info
router.post('/api/updateUserInfo', upload.single('image'), async (req, res) => {
  try {
    const { userInfo, username } = req.body;
    const image = req.file;

    // Log received data
    console.log('User Info:', userInfo);
    console.log('Username:', username);
    console.log('Image:', image);

    res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to save image data to storage (example)
async function saveImageToStorage(base64ImageData) {
  // Here you implement the logic to save the base64 image data to your storage system
  // For example, if using filesystem storage, you might write the data to a file
  // If using a cloud storage service, you would upload the image data to the service
  // This function should return the path or URL of the saved image
  
  // For demonstration, let's assume we're saving to the filesystem
  const fs = require('fs');
  const path = require('path');

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Generate a unique filename
  const fileName = `${Date.now()}.png`;
  const filePath = path.join(uploadDir, fileName);

  // Convert base64 data to binary and write to file
  const imageData = Buffer.from(base64ImageData, 'base64');
  fs.writeFileSync(filePath, imageData);

  return filePath; // Return the path where the image is saved
}

module.exports = router;
