import React from 'react';
import './styles.css';
import neonSpace  from './images/temp.png';

function NotFound() {
  return (
    <div className="container">
      <div className="error-message">
        <h1>Confusion<br />404: This is not the webpage you are looking for</h1>
        <img src={neonSpace} alt="Temporary Image" />
      </div>
    </div>
  );
}

export default NotFound;
