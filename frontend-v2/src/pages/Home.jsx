import { Link } from 'react-router-dom';
import { useUserStore } from '../store';

export default function Home() {
  const { user, language, setLanguage } = useUserStore();

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-forest">♻️ ReNova AI</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                language === 'en' ? 'bg-forest text-white' : 'bg-white text-forest'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                language === 'hi' ? 'bg-forest text-white' : 'bg-white text-forest'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-forest mb-2">
            {language === 'en' ? 'Welcome back!' : 'वापसी पर स्वागत है!'}
          </h2>
          <p className="text-olive-dark">
            {language === 'en' 
              ? `Hello ${user?.name}, scan your waste to get disposal instructions` 
              : `नमस्ते ${user?.name}, अपशिष्ट को स्कैन करें और निपटान निर्देश प्राप्त करें`}
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/scan" className="card hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-forest mb-2">
                {language === 'en' ? 'Scan Waste' : 'अपशिष्ट स्कैन करें'}
              </h3>
              <p className="text-olive-dark">
                {language === 'en' 
                  ? 'Take photo and get AI-powered insights' 
                  : 'फ़ोटो लें और AI-संचालित जानकारी प्राप्त करें'}
              </p>
            </div>
          </Link>

          <Link to="/voice" className="card hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-forest mb-2">
                {language === 'en' ? 'Voice Query' : 'आवाज़ प्रश्न'}
              </h3>
              <p className="text-olive-dark">
                {language === 'en' 
                  ? 'Ask about waste disposal by voice' 
                  : 'आवाज़ से अपशिष्ट निपटान के बारे में पूछें'}
              </p>
            </div>
          </Link>

          <Link to="/map" className="card hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-forest mb-2">
                {language === 'en' ? 'Find Recyclers' : 'रीसाइकलर खोजें'}
              </h3>
              <p className="text-olive-dark">
                {language === 'en' 
                  ? 'See nearby recyclers on map' 
                  : 'मानचित्र पर निकटतम रीसाइकलर देखें'}
              </p>
            </div>
          </Link>

          <Link to="/impact" className="card hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-forest mb-2">
                {language === 'en' ? 'Your Impact' : 'आपका प्रभाव'}
              </h3>
              <p className="text-olive-dark">
                {language === 'en' 
                  ? 'View environmental contribution' 
                  : 'पर्यावरणीय योगदान देखें'}
              </p>
            </div>
          </Link>

          <Link to="/profile" className="card hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-forest mb-2">
                {language === 'en' ? 'My Profile' : 'मेरी प्रोफ़ाइल'}
              </h3>
              <p className="text-olive-dark">
                {language === 'en' 
                  ? 'View stats and redeem codes' 
                  : 'आंकड़े देखें और कोड रिडीम करें'}
              </p>
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="card bg-olive-light">
          <h3 className="text-lg font-bold text-forest mb-2">
            {language === 'en' ? 'How it works' : 'यह कैसे काम करता है'}
          </h3>
          <ul className="space-y-2 text-forest">
            <li>📸 {language === 'en' ? 'Capture waste image' : 'अपशिष्ट छवि कैप्चर करें'}</li>
            <li>🤖 {language === 'en' ? 'AI analyzes with CLIP vision model' : 'AI CLIP दृष्टि मॉडल से विश्लेषण करता है'}</li>
            <li>📚 {language === 'en' ? 'Searches global + personal knowledge base' : 'वैश्विक + व्यक्तिगत ज्ञान आधार खोजता है'}</li>
            <li>🗺️ {language === 'en' ? 'Finds nearest recyclers via OpenStreetMap' : 'OpenStreetMap के माध्यम से निकटतम रीसाइकलर ढूंढता है'}</li>
            <li>💡 {language === 'en' ? 'Get disposal instructions + environmental impact' : 'निपटान निर्देश + पर्यावरणीय प्रभाव प्राप्त करें'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
