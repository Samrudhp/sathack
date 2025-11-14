import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useScanStore } from '../store';
import { useGeolocation } from '../hooks';
import { voiceInput } from '../api';

export default function Voice() {
  const navigate = useNavigate();
  const { user, language } = useUserStore();
  const { setScan } = useScanStore();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      
      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await handleRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      setError(language === 'en' ? 'Microphone access denied' : 'माइक्रोफ़ोन एक्सेस अस्वीकृत');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
    if (locationLoading) {
      setError(language === 'en' ? 'Waiting for location...' : 'स्थान की प्रतीक्षा कर रहे हैं...');
      return;
    }

    if (!latitude || !longitude) {
      setError(language === 'en' ? 'Location required' : 'स्थान आवश्यक है');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await voiceInput(audioBlob, user.id, latitude, longitude, language);
      setScan(result, result.global_docs || [], result.personal_docs || []);
      navigate('/result');
    } catch (err) {
      console.error('Voice error:', err);
      setError(err.response?.data?.detail || (language === 'en' ? 'Voice processing failed' : 'आवाज़ प्रसंस्करण विफल रहा'));
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
            background: 'linear-gradient(135deg, #d87941 0%, #c14543 100%)',
            boxShadow: '0 6px 16px rgba(216, 121, 65, 0.3)'
          }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2d5016' }}>
            {language === 'en' ? 'Voice Query' : 'आवाज़ प्रश्न'}
          </h1>
        </div>

        {loading ? (
          <div className="card text-center py-16">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full" style={{
                background: 'linear-gradient(135deg, #d87941 0%, #c14543 100%)',
                animation: 'spin 2s linear infinite'
              }}></div>
              <div className="absolute inset-2 rounded-full" style={{ background: 'white' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🎵</div>
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: '#2d5016' }}>
              {language === 'en' ? 'Processing voice...' : 'आवाज़ प्रसंस्करण...'}
            </p>
            <p className="text-sm" style={{ color: '#5f7c4d' }}>
              {language === 'en' 
                ? 'Whisper transcribing, searching knowledge base...' 
                : 'Whisper ट्रांसक्राइबिंग, ज्ञान आधार खोज रहा है...'}
            </p>
          </div>
        ) : (
          <>
            <div className="card text-center py-16 relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(180, 212, 165, 0.1) 0%, rgba(135, 168, 120, 0.05) 100%)'
            }}>
              <div className="absolute top-4 right-4 text-6xl opacity-5">🎵</div>
              <div className="absolute bottom-4 left-4 text-6xl opacity-5">🌿</div>
              
              <div className="relative z-10">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all ${isRecording ? 'scale-110 animate-pulse' : ''}`} 
                     style={{
                       background: isRecording 
                         ? 'linear-gradient(135deg, #c14543 0%, #d87941 100%)' 
                         : 'linear-gradient(135deg, #d87941 0%, #c14543 100%)',
                       boxShadow: isRecording 
                         ? '0 8px 32px rgba(193, 69, 67, 0.5)' 
                         : '0 8px 24px rgba(216, 121, 65, 0.3)'
                     }}>
                  {isRecording ? (
                    <div className="w-6 h-6 rounded-sm bg-white"></div>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#2d5016' }}>
                  {isRecording 
                    ? (language === 'en' ? 'Recording...' : 'रिकॉर्डिंग...')
                    : (language === 'en' ? 'Ask Your Question' : 'अपना प्रश्न पूछें')}
                </h2>
                <p className="mb-6" style={{ color: '#5f7c4d' }}>
                  {isRecording 
                    ? (language === 'en' ? 'Speak now. Click stop when done.' : 'अब बोलें। समाप्त होने पर स्टॉप क्लिक करें।')
                    : (language === 'en' ? 'Example: "How do I dispose plastic bottles?"' : 'उदाहरण: "प्लास्टिक की बोतलों का निपटान कैसे करें?"')}
                </p>
                {!isRecording ? (
                  <button 
                    onClick={startRecording} 
                    className="px-8 py-4 rounded-full text-xl font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(74, 124, 44, 0.3)'
                    }}
                  >
                    🎤 {language === 'en' ? 'Start Recording' : 'रिकॉर्डिंग शुरू करें'}
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording} 
                    className="px-8 py-4 rounded-full text-xl font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #c14543 0%, #d87941 100%)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(193, 69, 67, 0.3)'
                    }}
                  >
                    ⏹️ {language === 'en' ? 'Stop Recording' : 'रिकॉर्डिंग बंद करें'}
                  </button>
                )}
              </div>
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
                {language === 'en' ? 'How it works' : 'यह कैसे काम करता है'}
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: '#5f7c4d' }}>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🎙️</span>
                  <span>{language === 'en' ? 'Whisper AI transcribes your voice' : 'Whisper AI आपकी आवाज़ को ट्रांसक्राइब करता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🔄</span>
                  <span>{language === 'en' ? 'Text converted to vector embedding' : 'टेक्स्ट को वेक्टर एम्बेडिंग में बदला जाता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">📚</span>
                  <span>{language === 'en' ? 'Searches global + personal RAG database' : 'वैश्विक + व्यक्तिगत RAG डेटाबेस खोजता है'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✨</span>
                  <span>{language === 'en' ? 'LLM generates contextual answer' : 'LLM संदर्भात्मक उत्तर उत्पन्न करता है'}</span>
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
