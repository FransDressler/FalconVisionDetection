import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import VideoAnalysis from './pages/VideoAnalysis';
import Settings from './pages/Settings';
import { useState } from 'react';
import { ModelProvider } from './context/ModelContext';
import logo from './assets/icon.png';
// import LiveDetection from './pages/LiveDetection';

function App() {
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const t = (de: string, en: string) => (language === 'de' ? de : en);

  return (
    <ModelProvider>
      <Router>
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow-md border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="FalconVision Logo"
              className="h-10 w-10 drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-sky-800 tracking-wide">FalconVision 0.1</span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-gray-700 font-medium">
              <Link to="/analysis" className="hover:text-sky-600 transition">
                {t('Analyse', 'Analysis')}
              </Link>
              {/* <Link to="/live" className="hover:text-sky-600 transition">
                {t('Live', 'Live')}
              </Link> */}
              <Link to="/settings" className="hover:text-sky-600 transition">
                {t('Einstellungen', 'Settings')}
              </Link>
            </nav>

            <button
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-sky-100 transition text-sm"
            >
              {language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
            </button>
          </div>
        </header>

        {/* Routes */}
        <main className="">
          <Routes>
            <Route path="/" element={<Navigate to="/analysis" />} />
            <Route path="/analysis" element={<VideoAnalysis language={language} />} />
            <Route path="/settings" element={<Settings language={language} setLanguage={setLanguage} />} />
            {/* <Route path="/live" element={<LiveDetection language={language} />} /> */}
          </Routes>
        </main>
      </Router>
    </ModelProvider>
  );
}

export default App;
