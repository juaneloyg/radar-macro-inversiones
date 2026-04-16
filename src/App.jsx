import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import IndicatorDetail from './pages/IndicatorDetail';
import AssetExplorer from './pages/AssetExplorer';
import BaseFuentes from './pages/BaseFuentes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetExplorer />} />
          <Route path="base" element={<BaseFuentes />} />
          <Route path="indicator/:id" element={<IndicatorDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
