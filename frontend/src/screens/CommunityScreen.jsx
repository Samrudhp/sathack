import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { Card, Badge, Avatar } from '../components/ReactBits';
import OSMMap from '../components/OSMMap';

const CommunityScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock data
  const apartmentStats = {
    name: 'Green Valley Apartments',
    rank: 3,
    total_recyclers: 127,
    co2_saved: 1245.5,
    items_recycled: 3420,
  };

  const leaderboard = [
    { name: 'Priya Sharma', items: 245, co2: 122.5, avatar: null, rank: 1 },
    { name: 'Raj Kumar', items: 198, co2: 99.0, avatar: null, rank: 2 },
    { name: 'Anita Singh', items: 176, co2: 88.0, avatar: null, rank: 3 },
    { name: 'You', items: 142, co2: 71.0, avatar: null, rank: 7 },
    { name: 'Vikram Patel', items: 121, co2: 60.5, avatar: null, rank: 8 },
  ];

  const nearbyHotspots = [
    { lat: 28.6139, lon: 77.2090, name: 'Hotspot A', items: 450 },
    { lat: 28.6239, lon: 77.2190, name: 'Hotspot B', items: 320 },
  ];

  return (
    <div className="min-h-screen bg-beige p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 text-forest font-semibold flex items-center gap-2"
        >
          ← {t('home')}
        </button>

        <h1 className="text-3xl font-bold text-forest mb-6">
          {t('community_nav')} 👥
        </h1>

        {/* Apartment Stats */}
        <Card className="mb-6 bg-gradient-to-r from-forest to-olive text-white">
          <h2 className="text-2xl font-bold mb-4">🏢 {apartmentStats.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold">{apartmentStats.rank}</div>
              <div className="text-sm opacity-90">City Rank</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{apartmentStats.total_recyclers}</div>
              <div className="text-sm opacity-90">Active Recyclers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{apartmentStats.co2_saved} kg</div>
              <div className="text-sm opacity-90">CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{apartmentStats.items_recycled}</div>
              <div className="text-sm opacity-90">Items Recycled</div>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="mb-6">
          <h3 className="text-2xl font-bold text-forest mb-4">
            🏆 {t('community.leaderboard')}
          </h3>
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  user.name === 'You'
                    ? 'bg-olive bg-opacity-30 border-2 border-forest'
                    : 'bg-beige'
                }`}
              >
                <div className="text-2xl font-bold text-forest w-8">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </div>
                <Avatar src={user.avatar} alt={user.name} size="md" />
                <div className="flex-1">
                  <div className="font-bold text-forest">
                    {user.name}
                    {user.name === 'You' && (
                      <Badge variant="primary" className="ml-2">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.items} items • {user.co2} kg CO₂
                  </div>
                </div>
                {user.rank <= 3 && (
                  <Badge variant="success">
                    Top {user.rank}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Recycling Hotspots Map */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-forest mb-4">
            🗺️ Recycling Hotspots
          </h3>
          <OSMMap
            center={[28.6139, 77.2090]}
            zoom={12}
            recyclers={nearbyHotspots.map(h => ({
              id: h.name,
              lat: h.lat,
              lon: h.lon,
              name: h.name,
              distance: 0,
              eta: 0,
              price: 0,
            }))}
            className="h-80"
          />
        </div>

        {/* Challenges */}
        <Card>
          <h3 className="text-2xl font-bold text-forest mb-4">
            🎯 Community Challenges
          </h3>
          <div className="space-y-4">
            {[
              {
                title: 'Weekend Warrior',
                description: 'Recycle 10 items this weekend',
                progress: 6,
                total: 10,
                reward: '+50 tokens',
              },
              {
                title: 'E-Waste Hero',
                description: 'Recycle 5 electronic items',
                progress: 2,
                total: 5,
                reward: '+100 tokens',
              },
              {
                title: 'Building Challenge',
                description: 'Help your building reach 5000 items',
                progress: 3420,
                total: 5000,
                reward: 'Premium Badge',
              },
            ].map((challenge, i) => (
              <div key={i} className="p-4 bg-beige rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-forest">{challenge.title}</h4>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <Badge variant="success">{challenge.reward}</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {challenge.progress} / {challenge.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-forest rounded-full h-2 transition-all"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommunityScreen;
