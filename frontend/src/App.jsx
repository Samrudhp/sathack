import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';

// Screens
import SplashParallax from './components/SplashParallax';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import VoiceScreen from './screens/VoiceScreen';
import ResultScreen from './screens/ResultScreen';
import MapScreen from './screens/MapScreen';
import PickupScreen from './screens/PickupScreen';
import ImpactScreen from './screens/ImpactScreen';
import TokensScreen from './screens/TokensScreen';
import CommunityScreen from './screens/CommunityScreen';
import SettingsScreen from './screens/SettingsScreen';

// Recycler Screens
import RecyclerLoginScreen from './screens/RecyclerLoginScreen';
import RecyclerDashboardScreen from './screens/RecyclerDashboardScreen';
import RecyclerItemScreen from './screens/RecyclerItemScreen';
import RecyclerTokenIssuedScreen from './screens/RecyclerTokenIssuedScreen';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<SplashParallax />} />
          <Route path="/splash" element={<SplashParallax />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/voice" element={<VoiceScreen />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/pickup" element={<PickupScreen />} />
          <Route path="/impact" element={<ImpactScreen />} />
          <Route path="/tokens" element={<TokensScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />

          {/* Recycler Routes */}
          <Route path="/recycler/login" element={<RecyclerLoginScreen />} />
          <Route path="/recycler/dashboard" element={<RecyclerDashboardScreen />} />
          <Route path="/recycler/item/:scan_id" element={<RecyclerItemScreen />} />
          <Route path="/recycler/token-issued" element={<RecyclerTokenIssuedScreen />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
