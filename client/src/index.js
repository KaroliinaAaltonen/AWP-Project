// client/src/index.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import i18n from './i18n'; // Import i18n configuration
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import MainPage from './MainPage';
import EditInfoPage from './EditInfoPage';
import DisplayChatsPage from './DisplayChatsPage';
import NotFound from './NotFound';
import reportWebVitals from './reportWebVitals';
import AdminPage from './AdminPage';
import AdminEditInfo from './AdminEditInfo';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}> {/* Wrapping app with I18nextProvider and passing i18n */}
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/editinfo" element={<EditInfoPage />} />
          <Route path="/chats" element={<DisplayChatsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/edit-user/:username" element={<AdminEditInfo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </I18nextProvider>
  </React.StrictMode>
);

reportWebVitals();
