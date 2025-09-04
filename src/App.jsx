import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Files from './pages/Files';
import Analytics from './pages/Analytics';
import Marketplace from './pages/Marketplace';
import { FileProvider } from './context/FileContext';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <FileProvider>
      <div className="min-h-screen bg-dark-bg text-dark-text">
        <div className="flex">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <main className="flex-1 ml-64">
            <div className="p-6">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'upload' && <Upload />}
              {currentPage === 'files' && <Files />}
              {currentPage === 'analytics' && <Analytics />}
              {currentPage === 'marketplace' && <Marketplace />}
            </div>
          </main>
        </div>
      </div>
    </FileProvider>
  );
}

export default App;