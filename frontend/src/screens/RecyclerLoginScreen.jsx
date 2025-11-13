import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Button, Input } from '../components/ReactBits';
import { recyclerLogin } from '../api/api';
import { useRecyclerStore } from '../stores';

const RecyclerLoginScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setRecycler, setToken } = useRecyclerStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await recyclerLogin(formData.email, formData.password);
      setRecycler(result.recycler);
      setToken(result.token);
      navigate('/recycler/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">♻️</div>
          <h1 className="text-3xl font-bold text-forest">{t('recycler.login')}</h1>
          <p className="text-olive mt-2">Access your recycler dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {error && (
            <div className="mb-4 bg-hazard text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mb-3"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Back to User App
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RecyclerLoginScreen;
