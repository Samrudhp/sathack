import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Input } from '../components/ReactBits';
import { useUserStore, useLanguageStore } from '../stores';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useUserStore();
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          {t('settings_nav')} ⚙️
        </h1>

        {/* Profile Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">{t('settings.profile')}</h3>
          <div className="space-y-3">
            <Input
              type="text"
              label="Name"
              value={user?.name || ''}
              disabled
            />
            <Input
              type="email"
              label="Email"
              value={user?.email || ''}
              disabled
            />
            <Button variant="outline" className="w-full" disabled>
              Edit Profile (Coming Soon)
            </Button>
          </div>
        </Card>

        {/* Language Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">{t('settings.language')}</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-700">App Language</div>
              <div className="text-sm text-gray-600">
                Current: {language === 'en' ? 'English' : 'हिंदी'}
              </div>
            </div>
            <Button variant="primary" onClick={toggleLanguage}>
              {language === 'en' ? 'हिं' : 'EN'}
            </Button>
          </div>
        </Card>

        {/* Address Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">{t('settings.address')}</h3>
          <Input
            type="text"
            placeholder="Enter your address"
            value={user?.address || ''}
            disabled
          />
          <Button variant="outline" className="w-full mt-3" disabled>
            Update Address (Coming Soon)
          </Button>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">{t('settings.notifications')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Pickup Reminders</span>
              <input type="checkbox" className="w-6 h-6" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Impact Updates</span>
              <input type="checkbox" className="w-6 h-6" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Community Achievements</span>
              <input type="checkbox" className="w-6 h-6" defaultChecked />
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-forest mb-4">About ReNova</h3>
          <p className="text-gray-600 text-sm mb-3">
            Version 1.0.0
          </p>
          <div className="space-y-2 text-sm">
            <button className="text-forest font-semibold">Privacy Policy</button>
            <br />
            <button className="text-forest font-semibold">Terms of Service</button>
            <br />
            <button className="text-forest font-semibold">Help & Support</button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button variant="danger" onClick={handleLogout} className="w-full">
          {t('settings.logout')}
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;
