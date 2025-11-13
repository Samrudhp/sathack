import React from 'react';
import { useTranslation } from '../../node_modules/react-i18next';

const HazardBanner = ({ hazardType, instructions }) => {
  const { t } = useTranslation();

  return (
    <div className="hazard-banner mb-6 flex items-start gap-3">
      <div className="text-3xl">⚠️</div>
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-2">{t('hazard_warning')}</h3>
        <p className="text-sm mb-2">{instructions || t('hazard_instructions')}</p>
        {hazardType && (
          <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded inline-block">
            Type: {hazardType}
          </div>
        )}
      </div>
    </div>
  );
};

export default HazardBanner;
