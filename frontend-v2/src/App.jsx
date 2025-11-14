import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useUserStore } from './store';
import SplashScreen from './components/SplashScreen';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Voice from './pages/Voice';
import Result from './pages/Result';
import Map from './pages/Map';
import Impact from './pages/Impact';
import Profile from './pages/Profile';

function App() {
  const { user, setUser, setUserId } = useUserStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Ensure user is initialized (for testing without auth)
    if (!user || !user.id) {
      console.log('Initializing mock user...');
      const mockUserId = '691642ec8c548b95117f24c1';  // Valid ObjectId from backend seeded data
      setUser({
        id: mockUserId,
        name: 'Test User',
        phone: '+919876543210'
      });
      setUserId(mockUserId);
    }
  }, [user, setUser, setUserId]);

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/result" element={<Result />} />
        <Route path="/map" element={<Map />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

