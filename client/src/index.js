import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import RegistrationPage from './RegistrationPage';
import MainPage from './MainPage';
import EditInfoPage from './EditInfoPage';
import DisplayChatsPage from './DisplayChatsPage';
import NotFound from './NotFound';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/editinfo" element={<EditInfoPage />} />
        <Route path="/chats" element={<DisplayChatsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
