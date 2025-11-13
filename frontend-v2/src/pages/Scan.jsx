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
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-forest font-semibold flex items-center gap-2 hover:gap-4 transition-all"
        >
          ← {language === 'en' ? 'Back' : 'वापस'}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          📸 {language === 'en' ? 'Scan Waste' : 'अपशिष्ट स्कैन करें'}
        </h1>

        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin text-6xl mb-4">⚙️</div>
            <p className="text-xl font-semibold text-forest">
              {language === 'en' ? 'Processing...' : 'प्रसंस्करण...'}
            </p>
            <p className="text-olive-dark mt-2">
              {language === 'en' 
                ? 'AI analyzing image, searching knowledge base, finding recyclers...' 
                : 'AI छवि का विश्लेषण कर रहा है, ज्ञान आधार खोज रहा है, रीसाइकलर ढूंढ रहा है...'}
            </p>
          </div>
        ) : (
          <>
            <div className="card text-center py-16 cursor-pointer hover:bg-olive-light transition-all"
                 onClick={() => fileInputRef.current?.click()}>
              <div className="text-8xl mb-6">📸</div>
              <h2 className="text-2xl font-bold text-forest mb-2">
                {language === 'en' ? 'Capture Waste Photo' : 'अपशिष्ट फ़ोटो कैप्चर करें'}
              </h2>
              <p className="text-olive-dark mb-6">
                {language === 'en' 
                  ? 'Click to open camera or select image' 
                  : 'कैमरा खोलने के लिए क्लिक करें या छवि चुनें'}
              </p>
              <button className="btn-primary">
                {language === 'en' ? '📷 Open Camera' : '📷 कैमरा खोलें'}
              </button>
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
              <div className="mt-6 bg-hazard text-white p-4 rounded-lg text-center font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="mt-6 card bg-forest-light text-white">
              <h3 className="font-bold mb-2">
                {language === 'en' ? 'What happens next?' : 'आगे क्या होता है?'}
              </h3>
              <ul className="space-y-1 text-sm">
                <li>✓ {language === 'en' ? 'CLIP AI analyzes material & cleanliness' : 'CLIP AI सामग्री और स्वच्छता का विश्लेषण करता है'}</li>
                <li>✓ {language === 'en' ? 'RAG searches global + personal knowledge' : 'RAG वैश्विक + व्यक्तिगत ज्ञान खोजता है'}</li>
                <li>✓ {language === 'en' ? 'OpenStreetMap finds nearest recyclers' : 'OpenStreetMap निकटतम रीसाइकलर ढूंढता है'}</li>
                <li>✓ {language === 'en' ? 'LLM generates disposal instructions' : 'LLM निपटान निर्देश उत्पन्न करता है'}</li>
                <li>✓ {language === 'en' ? 'Translated to your language' : 'आपकी भाषा में अनुवादित'}</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}