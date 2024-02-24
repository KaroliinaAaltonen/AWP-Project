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
// MongoDB schema for chat logs
const chatlogSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', usersSchema);
const Match = mongoose.model('Match', likeSchema);
const Chatlog = mongoose.model('Chatlog', chatlogSchema);

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

    // Check if the user is an admin
    const isAdmin = (username === 'Admin'); // Check if username is 'Admin'
    console.log('isAdmin:', isAdmin); // Log isAdmin value

    // If username and password are correct, generate a JWT token
    const token = jwt.sign({ username, isAdmin }, secretKey);

    // Send a JSON response with the token
    res.status(200).json({ message: 'Login successful', token, isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to get random user from database (used in Main Page to display profiles)
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
// Route to handle user likes (used in Main Page on like button press)
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
      // Create an empty conversation
      const participants = [currentUser._id, likedUserId];
      const newConversation = new Chatlog({ participants });
      await newConversation.save();

      return res.status(200).json({ message: 'User liked successfully', match: true });
    }

    res.status(200).json({ message: 'User liked successfully', match: false });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to get user information by username (used in Edit Info page to display current profile)
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
// Route to handle updating user info (used in Edit Info page onsubmit())
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
// Route to get user information by user ID (used in chat view)
router.get('/api/userInfoById/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
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
// Route to fetch available conversations for a user (used in chat view)
router.get('/api/conversations/:username', async (req, res) => {
  try {
    const username = req.params.username;
    // Fetch user from the database based on the username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Fetch conversations for the user from the database
    const conversations = await Chatlog.find({ participants: user._id });
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to create a new conversation (used in chat view)
router.post('/api/conversations', async (req, res) => {
  try {
    const { participants } = req.body;
    // Create a new conversation in the database
    const newConversation = new Chatlog({ participants });
    await newConversation.save();
    res.status(201).json({ message: 'Conversation created successfully', conversation: newConversation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to send a message in a conversation (used in chat view)
router.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { sender, content } = req.body;
    
    // Find the conversation by ID
    const conversation = await Chatlog.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Retrieve the sender's information from the database
    const user = await User.findOne({ username: sender });
    if (!user) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Add the new message to the conversation along with sender's information
    conversation.messages.push({ sender: user._id, content });
    await conversation.save();
    res.status(201).json({ message: 'Message sent successfully', conversation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to fetch messages for a conversation (used in chat view)
router.get('/api/conversations/:conversationId/get-messages', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    // Find the conversation by ID
    const conversation = await Chatlog.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    // Retrieve sender information from the database based on sender ID
    const messagesWithSenders = await Promise.all(conversation.messages.map(async (message) => {
      const sender = await User.findById(message.sender);
      return { sender: sender.username, content: message.content };
    }));
    res.status(200).json({ messages: messagesWithSenders });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route for admin page
router.get('/api/admin', async function(req, res) {
  try {
    // Check if the user is authenticated and is an admin
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    const isAdmin = decodedToken.isAdmin;
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Only admins can access this route' });
    }
    res.status(200).json({ message: 'Admin route accessed successfully' });
  } catch (error) {
    // Handle authentication errors
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});
// Route to fetch user profiles for admin
router.get('/api/admin/profiles', async (req, res) => {
  try {
    // Fetch all user profiles except the Admin profile
    const userProfiles = await User.find({ username: { $ne: 'Admin' } }, { password: 0 }); // Exclude password field
    // Return the user profiles
    res.status(200).json({ userProfiles });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to fetch matches and chat logs for a specific user
router.get('/api/admin/user-data/:username', async (req, res) => {
  try {
    const username = req.params.username;
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Fetch matches for the user
    const matches = await Match.find({ user: user._id });
    // Fetch chat logs for the user
    const chatlogs = await Chatlog.find({ participants: user._id });
    // Return matches, chat logs, and conversation IDs
    res.status(200).json({ matches, chatlogs });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route for admin to delete user and all their data
router.delete('/api/admin/users/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    // Find the user by username to get their ID
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = user._id;

    // Delete user from the users collection
    await User.findByIdAndDelete(userId);

    // Delete likes associated with the user
    await Match.deleteMany({ $or: [{ user: userId }, { likedUser: userId }] });

    // Delete chatlogs associated with the user
    await Chatlog.deleteMany({ participants: userId });

    res.status(200).json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to handle editing user information
router.post('/api/admin/edit-user/:username', formidable(), async (req, res) => {
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

module.exports = router;
