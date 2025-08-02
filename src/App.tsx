import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HomePage } from './components/HomePage';
import { OrderPage } from './components/OrderPage';
import { PreviewPage } from './components/PreviewPage';
import { CoverLetterPreview } from './components/CoverLetterPreview';
import { LinkedInPreview } from './components/LinkedInPreview';
import { BundlePreview } from './components/BundlePreview';
import NotFound from './not-found';
import { useTheme } from './hooks/useTheme';

// Theme and Language Context Provider Component
const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  
  // Apply theme class to body for additional styling if needed
  React.useEffect(() => {
    const themeClass = isDarkMode ? 'dark-theme' : 'light-theme';
    const langClass = `lang-${language}`;
    document.body.className = `${themeClass} ${langClass}`;
  }, [isDarkMode, language]);
  
  return <>{children}</>;
};

function App() {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  
  return (
    <ThemeLanguageProvider>
      <Router>
        <div className={`App min-h-screen transition-all duration-300 ${isDarkMode ? 'dark' : 'light'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/order/:serviceType" element={<OrderPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/cover-letter-preview" element={<CoverLetterPreview />} />
            <Route path="/linkedin-preview" element={<LinkedInPreview />} />
            <Route path="/bundle-preview" element={<BundlePreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={language === 'ar'}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDarkMode ? 'dark' : 'light'}
            toastStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              fontFamily: language === 'ar' ? '29LT Riwaya' : 'Hagrid',
            }}
          />
        </div>
      </Router>
    </ThemeLanguageProvider>
  );
}

export default App;