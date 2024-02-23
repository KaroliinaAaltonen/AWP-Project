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

// MongoDB schema for users
const usersSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  profileImage: { type: String },
  userInfo: { type: String }
});
// MongoDB schema for user likes (matches)
const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', usersSchema);
const Match = mongoose.model('Match', likeSchema);

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
// Route to get random user from database
router.get('/api/randomUser/:username', async (req, res) => {
  try {
    const currLogInUser = req.params.username;
    // Fetch a random user excluding the currently logged-in user
    const user = await User.aggregate([
      { $match: { username: { $ne: currLogInUser } } }, // Exclude current user
      { $sample: { size: 1 } } // Get a random user
    ]);
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'Random user not found' });
    }
    // Return user information including the profile image URL
    res.status(200).json({ userInfo: user[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to handle user likes
router.post('/api/like/:likedUserId/:username', async (req, res) => {
  try {
    const currentUserUsername = req.params.username;
    if (!currentUserUsername) {
      return res.status(401).json({ error: 'Unauthorized: Missing current user' });
    }

    // Find the current user in the database
    const currentUser = await User.findOne({ username: currentUserUsername });
    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    const { likedUserId } = req.params;

    // Check if the like already exists
    const existingLike = await Match.findOne({ user: currentUser._id, likedUser: likedUserId });
    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this user' });
    }

    // Create a new like entry
    const newLike = new Match({
      user: currentUser._id,
      likedUser: likedUserId
    });

    // Save the new like
    await newLike.save();

    // Check if there is a match
    const reverseLike = await Match.findOne({ user: likedUserId, likedUser: currentUser._id });
    if (reverseLike) {
      return res.status(200).json({ message: 'User liked successfully', match: true });
    }

    res.status(200).json({ message: 'User liked successfully', match: false });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
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
// Function to delete duplicate images from storage (simply based to filename so not the best solution)
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
// Function to save an image from storage (simply with the original filename so not the best solution)
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