import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ensureHighlightsTableExists } from './services/ocrStorageService'

// تلاش برای ایجاد جدول highlights در هنگام شروع برنامه
ensureHighlightsTableExists()
  .then((success) => {
    console.log('Highlights table initialization:', success ? 'successful' : 'failed');
  })
  .catch((error) => {
    console.error('Error initializing highlights table:', error);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
