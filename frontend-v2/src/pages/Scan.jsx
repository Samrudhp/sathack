import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useScanStore } from '../store';
import { useGeolocation } from '../hooks';
import { scanImage } from '../api';

const HARDCODED_USER_ID = '673fc7f4f1867ab46b0a8c01';

export default function Scan() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { language } = useUserStore();
  const { setScan } = useScanStore();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    console.log('User ID:', HARDCODED_USER_ID);
    console.log('Location:', { latitude, longitude, loading: locationLoading });

    if (locationLoading) {
      setError(language === 'en' ? 'Waiting for location...' : 'स्थान की प्रतीक्षा कर रहे हैं...');
      return;
    }

    if (!latitude || !longitude) {
      setError(language === 'en' ? 'Location required. Please enable location access.' : 'स्थान आवश्यक है। कृपया स्थान पहुंच सक्षम करें।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Calling scanImage API with:', {
        fileName: file.name,
        userId: HARDCODED_USER_ID,
        latitude,
        longitude,
        language
      });

      const result = await scanImage(file, HARDCODED_USER_ID, latitude, longitude, language);
      
      console.log('Scan result:', result);
      
      // Store result with RAG docs if available
      setScan(result, result.global_docs || [], result.personal_docs || []);
      
      // Navigate to result
      navigate('/result');
    } catch (err) {
      console.error('Scan error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || err.message || (language === 'en' ? 'Scan failed' : 'स्कैन विफल रहा');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#faf8f3' }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 font-semibold flex items-center gap-2 hover:gap-4 transition-all rounded-full px-6 py-3"
          style={{
            color: '#2d5016',
            background: 'white',
            border: '2px solid #e8dfd0'
          }}
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
            boxShadow: '0 6px 16px rgba(74, 124, 44, 0.3)'
          }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'Scan Waste' : 'अपशिष्ट स्कैन करें'}
          </h1>
        </div>

        {loading ? (
          <div className="card text-center py-16">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full" style={{
                background: 'linear-gradient(135deg, #87a878 0%, #4a7c2c 100%)',
                animation: 'spin 2s linear infinite'
              }}></div>
              <div className="absolute inset-2 rounded-full" style={{ background: 'white' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🔄</div>
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: '#2d5016' }}>
              {language === 'en' ? 'Processing...' : 'प्रसंस्करण...'}
            </p>
            <p className="text-sm" style={{ color: '#5f7c4d' }}>
              {language === 'en' 
                ? 'AI analyzing image, searching knowledge base, finding recyclers...' 
                : 'AI छवि का विश्लेषण कर रहा है, ज्ञान आधार खोज रहा है, रीसाइकलर ढूंढ रहा है...'}
            </p>
          </div>
        ) : (
          <>
            <div className="card text-center py-16 cursor-pointer group relative overflow-hidden"
                 onClick={() => fileInputRef.current?.click()}
                 style={{
                   background: 'linear-gradient(135deg, rgba(180, 212, 165, 0.1) 0%, rgba(135, 168, 120, 0.05) 100%)'
                 }}>
              <div className="absolute top-4 right-4 text-6xl opacity-5">🌿</div>
              <div className="absolute bottom-4 left-4 text-6xl opacity-5">📸</div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110" style={{
                  background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
                  boxShadow: '0 8px 24px rgba(74, 124, 44, 0.3)'
                }}>
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#2d5016' }}>
                  {language === 'en' ? 'Capture Waste Photo' : 'अपशिष्ट फ़ोटो कैप्चर करें'}
                </h2>
                <p className="mb-6" style={{ color: '#5f7c4d' }}>
                  {language === 'en' 
                    ? 'Click to open camera or select image' 
                    : 'कैमरा खोलने के लिए क्लिक करें या छवि चुनें'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-2xl text-center font-semibold" style={{
                background: 'linear-gradient(135deg, #c14543 0%, #d87941 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(193, 69, 67, 0.2)'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="mt-6 card" style={{
              background: 'linear-gradient(135deg, rgba(180, 212, 165, 0.15) 0%, rgba(135, 168, 120, 0.1) 100%)'
            }}>
              <h3 className="font-bold mb-3 text-lg" style={{ color: '#2d5016' }}>
                {language === 'en' ? 'What happens next?' : 'आगे क्या होता है?'}
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: '#5f7c4d' }}>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🤖</span>
                  <span>{language === 'en' ? 'CLIP AI analyzes material & cleanliness' : 'CLIP AI सामग्री और स्वच्छता का विश्लेषण करता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">📚</span>
                  <span>{language === 'en' ? 'RAG searches global + personal knowledge' : 'RAG वैश्विक + व्यक्तिगत ज्ञान खोजता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <span>{language === 'en' ? 'OpenStreetMap finds nearest recyclers' : 'OpenStreetMap निकटतम रीसाइकलर ढूंढता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✨</span>
                  <span>{language === 'en' ? 'LLM generates disposal instructions' : 'LLM निपटान निर्देश उत्पन्न करता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🌐</span>
                  <span>{language === 'en' ? 'Translated to your language' : 'आपकी भाषा में अनुवादित'}</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}