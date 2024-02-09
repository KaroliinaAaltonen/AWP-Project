import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import BookDetails from './BookDetails';
import reportWebVitals from './reportWebVitals';
import NotFound from './NotFound';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        {/*Place holder */}
        <Route path="/book/:names" element={<BookDetails />} /> {/* Use BookDetails component */}
        <Route path="*" element={<NotFound />} /> { /* Use NotFound component */ }
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
