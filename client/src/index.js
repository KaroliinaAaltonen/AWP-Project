import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import MainPage from './MainPage';
import EditInfoPage from './EditInfoPage';
import DisplayChatsPage from './DisplayChatsPage';
import NotFound from './NotFound';
import reportWebVitals from './reportWebVitals';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/editinfo" element={<EditInfoPage />} />
        <Route path="/chats" element={<DisplayChatsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
