import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import './bookDetails.css';

function BookDetails() {
  const { names } = useParams();
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch book information from the server (backend uses localhost:1234 idk)
    fetch(`/api/book/${names}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Check if the book information is in the data
        if (data.existingBook) {
          const { _id, name, author, pages } = data.existingBook;
          setBookInfo({ _id, name, author, pages });
          console.log('Received Book Information:', { _id, name, author, pages }); // Log received book info to console
        } else {
          // If no matching book is found display error
          setError(true);
        }
      })
      .catch(error => {
        console.error('Error fetching book information:', error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [names]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // When in doubt show 404
  if (error) {
    return <NotFound />;
  }

  // If everything is as it should display book info
  return (
    <div className="container">
      <h1>Books</h1>
      <div className="book-info">
        <p>ID: {bookInfo._id}</p>
        <p>Name: {bookInfo.name}</p>
        <p>Author: {bookInfo.author}</p>
        <p>Pages: {bookInfo.pages}</p>
      </div>
    </div>
  );
}

export default BookDetails;
