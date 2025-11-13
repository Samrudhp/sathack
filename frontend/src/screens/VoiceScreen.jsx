import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import VoiceRecorder from '../components/VoiceRecorder';
import { Loader } from '../components/ReactBits';
import { voiceInput } from '../api/api';
import { useScanStore } from '../stores';

const VoiceScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setScan, addToHistory } = useScanStore();

  const handleRecordingComplete = async (audioBlob) => {
    setLoading(true);
    setError(null);
    try {
      const result = await voiceInput(audioBlob);
      setScan(result);
      addToHistory(result);
      navigate('/result');
    } catch (err) {
      setError(err.response?.data?.message || t('error.upload'));
      console.error('Voice input error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-beige p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">{t('voice_query')}</h1>

        {loading ? (
          <div className="card text-center py-12">
            <Loader size="lg" className="mx-auto mb-4" />
            <p className="text-forest font-semibold">{t('voice.processing')}</p>
          </div>
        ) : (
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} onCancel={handleCancel} />
        )}

        {error && (
          <div className="mt-4 bg-hazard text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceScreen;
