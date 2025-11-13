import React, { useState, useRef } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import { Button, Card, Loader } from './ReactBits';

const CameraInput = ({ onCapture, onCancel }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUsePhoto = () => {
    if (image) {
      onCapture(image);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      {!preview ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">📷</div>
          <h2 className="text-2xl font-bold text-forest mb-6">
            {t('camera.capture')}
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="camera-input"
          />
          <label htmlFor="camera-input">
            <Button variant="primary" className="cursor-pointer inline-block">
              {t('camera.capture')}
            </Button>
          </label>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="ml-4"
            >
              Cancel
            </Button>
          )}
        </div>
      ) : (
        <div>
          <img
            src={preview}
            alt="Captured"
            className="w-full rounded-lg mb-6"
          />
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleRetake}>
              {t('camera.retake')}
            </Button>
            <Button variant="primary" onClick={handleUsePhoto}>
              {t('camera.use_photo')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CameraInput;
