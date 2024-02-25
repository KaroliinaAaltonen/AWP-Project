// client/src/NotFound.js
import React from 'react';
import neonSpace  from './images/temp.png';
import { useTranslation } from 'react-i18next';
// Display 404 page if unknown route
function NotFound() {
  const { t } = useTranslation(); // Initialize translation hook
  return (
    <div className="nfcontainer">
      <div className="nferror-message">
        <h1>{t('confusion')}<br />{t('404 page')}</h1>
        <img src={neonSpace} alt="Temporary Image" />
      </div>
    </div>
  );
}

export default NotFound;
