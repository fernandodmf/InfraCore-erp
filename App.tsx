import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Clients from './pages/Clients';
import Production from './pages/Production';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Reports from './pages/Reports';
import Fleet from './pages/Fleet';
import Settings from './pages/Settings';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="clients" element={<Clients />} />
            <Route path="production" element={<Production />} />
            <Route path="finance" element={<Finance />} />
            <Route path="hr" element={<HR />} />
            <Route path="reports" element={<Reports />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;