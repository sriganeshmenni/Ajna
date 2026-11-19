import React, { useState } from 'react';
import ShowcaseLanding from './components/ShowcaseLanding';
import AdminCockpit from './components/AdminCockpit';
import CandidateCockpit from './components/CandidateCockpit';
import EvaluatorCockpit from './components/EvaluatorCockpit';
import AjnaAmbientBackground from './components/AjnaAmbientBackground';
import AuthPortal from './components/AuthPortal';
import TitleBar from './components/TitleBar';
import useAuthStore from './stores/authStore';
import './App.css';

function App() {
  const { user, token, isAuthenticated, logout, getWsTicket } = useAuthStore();
  
  // Start on the professional Showcase & Vision Portal on launch
  const [activeView, setActiveView] = useState('showcase');

  const handleLogout = () => {
    logout();
    setActiveView('showcase');
  };

  const handleRoleNavigation = (targetView) => {
    setActiveView(targetView);
  };

  const renderContent = () => {
    // 1. Showcase & Vision Landing Experience
    if (activeView === 'showcase') {
      return (
        <ShowcaseLanding 
          onSelectRole={handleRoleNavigation} 
          user={user} 
        />
      );
    }

    if (activeView === 'auth') {
      return <AuthPortal onLoginSuccess={handleRoleNavigation} onBack={() => setActiveView('showcase')} />;
    }

    // 2. Candidate Assessment Room
    if (activeView === 'candidate') {
      return (
        <CandidateCockpit 
          user={user || { full_name: 'Sri ram (Candidate #01)', email: 'candidate@antigravity.ai', role: 'candidate' }} 
          onLogout={handleLogout} 
          onNavigateRole={handleRoleNavigation} 
        />
      );
    }

    // 3. Admin Governance Hub
    if (activeView === 'admin') {
      return (
        <AdminCockpit 
          user={user || { full_name: 'Platform Administrator', email: 'admin@antigravity.ai', role: 'admin' }} 
          onLogout={handleLogout} 
          onNavigateRole={handleRoleNavigation} 
        />
      );
    }

    // 4. Lead Evaluator Suite (Default active evaluation view)
    return (
      <EvaluatorCockpit
        user={user || { full_name: 'Dr. Mounika (Lead Evaluator)', email: 'evaluator@antigravity.ai', role: 'evaluator' }}
        token={token}
        onLogout={handleLogout}
        onNavigateRole={handleRoleNavigation}
        getWsTicket={getWsTicket}
      />
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none flex flex-col">
      <TitleBar />
      {/* Subtle Luminous Background Glow & "AJNA" Typographic Brand Watermark */}
      <AjnaAmbientBackground />
      
      {/* Active Glass Interface */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
