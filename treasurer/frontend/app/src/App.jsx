import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';

import Dashboard from './pages/Dashboard.jsx';
import AIChat from './pages/AIChat.jsx';
import StrategyManager from './pages/StrategyManager.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import BudgetTracker from './pages/BudgetTracker.jsx';
import AuditLog from './pages/AuditLog.jsx';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:pl-60 pt-[72px]">
        <div className="p-5 max-w-[1400px]">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/strategy" element={<StrategyManager />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/budget" element={<BudgetTracker />} />
              <Route path="/audit" element={<AuditLog />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
