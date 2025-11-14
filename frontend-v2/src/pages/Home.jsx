import { Link } from 'react-router-dom';
import { useUserStore } from '../store';

export default function Home() {
  const { user, language, setLanguage } = useUserStore();

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#faf8f3' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Organic Header with Leaf Decorations */}
        <div className="mb-12 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative">
              <div className="absolute -top-4 -left-6 text-6xl opacity-10 rotate-12">🌱</div>
              <h1 className="text-5xl md:text-6xl font-bold relative z-10" style={{ 
                color: '#2d5016',
                textShadow: '2px 2px 0px rgba(135, 168, 120, 0.2)'
              }}>
                ReNova
              </h1>
              <p className="text-lg mt-2" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? 'Nature meets Technology' : 'प्रकृति मिलती है प्रौद्योगिकी से'}
              </p>
            </div>
            
            {/* Language Toggle - Organic Pills */}
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('en')}
                className="px-6 py-3 rounded-full font-semibold transition-all duration-300"
                style={{
                  background: language === 'en' ? 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)' : 'white',
                  color: language === 'en' ? 'white' : '#2d5016',
                  border: `2px solid ${language === 'en' ? '#4a7c2c' : '#e8dfd0'}`,
                  boxShadow: language === 'en' ? '0 4px 12px rgba(45, 80, 22, 0.2)' : 'none'
                }}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className="px-6 py-3 rounded-full font-semibold transition-all duration-300"
                style={{
                  background: language === 'hi' ? 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)' : 'white',
                  color: language === 'hi' ? 'white' : '#2d5016',
                  border: `2px solid ${language === 'hi' ? '#4a7c2c' : '#e8dfd0'}`,
                  boxShadow: language === 'hi' ? '0 4px 12px rgba(45, 80, 22, 0.2)' : 'none'
                }}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section with Environmental Graphic */}
        <div className="mb-12 relative overflow-hidden rounded-3xl" style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          boxShadow: '0 8px 32px rgba(45, 80, 22, 0.15)'
        }}>
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            {/* Text Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold" style={{
                  background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)'
                }}>
                  {user?.name?.charAt(0) || '🌱'}
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2d5016' }}>
                    {language === 'en' ? `Hey ${user?.name}!` : `नमस्ते ${user?.name}!`}
                  </h2>
                  <p style={{ color: '#5f7c4d', fontSize: '1.1rem' }}>
                    {language === 'en' 
                      ? 'Ready to make a difference today?' 
                      : 'आज बदलाव लाने के लिए तैयार हैं?'}
                  </p>
                </div>
              </div>
              
              <p className="text-lg mb-6" style={{ color: '#4a7c2c' }}>
                {language === 'en' 
                  ? 'Join thousands of eco-warriors turning waste into wealth with AI-powered recycling intelligence.' 
                  : 'AI-संचालित रीसाइक्लिंग बुद्धिमत्ता के साथ कचरे को धन में बदलने वाले हजारों पर्यावरण योद्धाओं में शामिल हों।'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(74, 124, 44, 0.1)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#2d5016' }}>
                    🎯 {language === 'en' ? 'Smart Scanning' : 'स्मार्ट स्कैनिंग'}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(74, 124, 44, 0.1)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#2d5016' }}>
                    🪙 {language === 'en' ? 'Earn Tokens' : 'टोकन कमाएं'}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(74, 124, 44, 0.1)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#2d5016' }}>
                    🌍 {language === 'en' ? 'Save Planet' : 'पृथ्वी बचाएं'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Environmental Graphic */}
            <div className="relative">
              <img 
                src="/assets/environ.png" 
                alt="Environmental AI Technology"
                className="w-full h-auto rounded-2xl"
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(45, 80, 22, 0.2))',
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{
                background: 'radial-gradient(circle, #4a7c2c 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}></div>
            </div>
          </div>
        </div>
        
        {/* Add animation keyframes */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.1); }
          }
        `}</style>

        {/* Feature Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          
          {/* Scan - Large Feature */}
          <Link to="/scan" className="md:col-span-8 card group cursor-pointer">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-3xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300" style={{
                background: 'linear-gradient(135deg, #4a7c2c 20%, #87a878 100%)',
                boxShadow: '0 8px 20px rgba(74, 124, 44, 0.3)'
              }}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="absolute top-2 right-2 text-2xl">✨</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d5016' }}>
                  {language === 'en' ? 'Scan Your Waste' : 'अपशिष्ट स्कैन करें'}
                </h3>
                <p style={{ color: '#5f7c4d' }}>
                  {language === 'en' 
                    ? 'Snap a photo and get instant AI-powered disposal guidance' 
                    : 'फ़ोटो लें और तुरंत AI-संचालित निपटान मार्गदर्शन प्राप्त करें'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#4a7c2c' }}>
                  Start Scanning <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Voice - Compact */}
          <Link to="/voice" className="md:col-span-4 card group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                background: 'linear-gradient(135deg, #d87941 0%, #c14543 100%)',
                boxShadow: '0 6px 16px rgba(216, 121, 65, 0.3)'
              }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'Voice Query' : 'आवाज़ प्रश्न'}
              </h3>
              <p className="text-sm" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? 'Ask questions' : 'प्रश्न पूछें'}
              </p>
            </div>
          </Link>

          {/* Map */}
          <Link to="/map" className="md:col-span-4 card group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                background: 'linear-gradient(135deg, #87a878 0%, #5f7c4d 100%)',
                boxShadow: '0 6px 16px rgba(135, 168, 120, 0.3)'
              }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'Find Recyclers' : 'रीसाइकलर खोजें'}
              </h3>
              <p className="text-sm" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? 'Nearby centers' : 'निकट केंद्र'}
              </p>
            </div>
          </Link>

          {/* Impact */}
          <Link to="/impact" className="md:col-span-4 card group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                background: 'linear-gradient(135deg, #a8c5dd 0%, #8b7355 100%)',
                boxShadow: '0 6px 16px rgba(168, 197, 221, 0.3)'
              }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'Your Impact' : 'आपका प्रभाव'}
              </h3>
              <p className="text-sm" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? 'See your stats' : 'आंकड़े देखें'}
              </p>
            </div>
          </Link>

          {/* Profile */}
          <Link to="/profile" className="md:col-span-4 card group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{
                background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                boxShadow: '0 6px 16px rgba(74, 124, 44, 0.3)'
              }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'Profile' : 'प्रोफ़ाइल'}
              </h3>
              <p className="text-sm" style={{ color: '#5f7c4d' }}>
                {language === 'en' ? 'Redeem tokens' : 'टोकन रिडीम करें'}
              </p>
            </div>
          </Link>
        </div>

        {/* How It Works - Natural Flow */}
        <div className="card relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(180, 212, 165, 0.1) 0%, rgba(135, 168, 120, 0.05) 100%)'
        }}>
          <div className="absolute -right-10 -top-10 text-9xl opacity-5">♻️</div>
          
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: '#2d5016' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #87a878 0%, #4a7c2c 100%)'
            }}>
              <span className="text-white text-xl">💡</span>
            </div>
            {language === 'en' ? 'How It Works' : 'यह कैसे काम करता है'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '1', text: language === 'en' ? 'Capture waste photo' : 'फोटो लें', icon: '📸' },
              { num: '2', text: language === 'en' ? 'AI analyzes material' : 'AI विश्लेषण', icon: '🤖' },
              { num: '3', text: language === 'en' ? 'Get instructions' : 'निर्देश पाएं', icon: '📝' },
              { num: '4', text: language === 'en' ? 'Find recycler' : 'रीसाइकलर ढूंढें', icon: '📍' },
              { num: '5', text: language === 'en' ? 'Earn tokens!' : 'टोकन पाएं!', icon: '🪙' }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center font-bold text-2xl relative z-10" style={{
                  background: 'white',
                  color: '#2d5016',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '2px solid #e8dfd0'
                }}>
                  {step.num}
                </div>
                <p className="text-sm font-medium" style={{ color: '#5f7c4d' }}>
                  {step.text}
                </p>
                {i < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full" style={{
                    borderTop: '2px dashed #b4d4a5',
                    transform: 'translateX(-50%)'
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
