var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
  name: {type: String},
  author: {type: String},
  pages: {type: Number}
});

const Book = mongoose.model('Books', booksSchema)

// home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/book', async function(req, res) {
  try {
    const { name, author, pages } = req.body;

    // Save the new book
    const book = new Book({ name, author, pages });
    await book.save();

    // Send a response
    res.json({  book });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/book/:name', async function(req, res) {
  try {
    const bookName = req.params.name;
    // Check if a book with the same name already exists
    const existingBook = await Book.findOne({ name: bookName });

    if (existingBook) {
      // If a book with the same name exists, send the book details
      return res.json({ existingBook });
    } else {
      // If no matching book is found, send a response indicating no match
      return res.json({ message: 'No Match' });
    }
  } catch (error) {
    // Handle any errors that occur during the database query or response sending
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;