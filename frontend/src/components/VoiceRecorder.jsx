import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import { Button, Card } from './ReactBits';

const VoiceRecorder = ({ onRecordingComplete, onCancel }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveform, setWaveform] = useState(Array(20).fill(0));
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      animationRef.current = setInterval(() => {
        setWaveform(Array(20).fill(0).map(() => Math.random() * 100));
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      setWaveform(Array(20).fill(0));
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUseRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleRetry = () => {
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎤</div>
        <h2 className="text-2xl font-bold text-forest mb-6">
          {isRecording ? t('voice.recording') : t('voice.speak_now')}
        </h2>

        {/* Waveform Animation */}
        <div className="flex items-center justify-center gap-1 h-32 mb-6">
          {waveform.map((height, i) => (
            <div
              key={i}
              className="w-2 bg-forest rounded-full transition-all duration-100"
              style={{ height: `${height}%`, minHeight: '10%' }}
            />
          ))}
        </div>

        {!audioBlob ? (
          <div className="space-y-4">
            {!isRecording ? (
              <div>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className="relative w-24 h-24 bg-forest rounded-full text-white text-4xl flex items-center justify-center hover:bg-opacity-90 transition-all mx-auto"
                >
                  🎤
                  <div className="absolute inset-0 rounded-full bg-forest opacity-50 pulse-ring" />
                </button>
                <p className="text-sm text-gray-600 mt-4">
                  {t('voice.press_hold')}
                </p>
              </div>
            ) : (
              <button
                onClick={stopRecording}
                className="w-24 h-24 bg-hazard rounded-full text-white text-4xl flex items-center justify-center hover:bg-opacity-90 transition-all mx-auto"
              >
                ⏹️
              </button>
            )}
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">✓ Recording Complete</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
              <Button variant="primary" onClick={handleUseRecording}>
                Use Recording
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceRecorder;
