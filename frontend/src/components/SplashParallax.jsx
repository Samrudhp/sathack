import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

const SplashParallax = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showCTA, setShowCTA] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Show CTA after 1.5 seconds
    const timer = setTimeout(() => setShowCTA(true), 1500);

    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 10 + Math.random() * 20,
    }));
    setParticles(newParticles);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 50,
      y: (clientY / innerHeight - 0.5) * 50,
    });
  };

  const handleEnterApp = () => {
    navigate('/home');
  };

  return (
    <div
      className="relative min-h-screen bg-beige overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Background Pattern Layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="forest-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="3" fill="#2f5233" />
            <circle cx="75" cy="75" r="3" fill="#2f5233" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#forest-pattern)" />
        </svg>
      </div>

      {/* Hills Background Layer */}
      <div
        className="absolute bottom-0 w-full"
        style={{
          transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <svg viewBox="0 0 1200 400" className="w-full">
          <path
            d="M0,300 Q300,200 600,280 T1200,300 L1200,400 L0,400 Z"
            fill="#afc3a2"
            opacity="0.5"
          />
          <path
            d="M0,320 Q400,240 800,320 T1200,340 L1200,400 L0,400 Z"
            fill="#2f5233"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Trees Layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px) scale(${1 + mousePos.x * 0.001})`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl opacity-20 float-animation"
            style={{
              left: `${20 + i * 15}%`,
              top: `${60 + (i % 2) * 10}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            🌲
          </div>
        ))}
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle text-2xl"
          style={{
            left: `${particle.left}%`,
            bottom: 0,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            fontSize: `${particle.size}px`,
          }}
        >
          🍃
        </div>
      ))}

      {/* Main Content Layer */}
      <div
        className="relative z-10 text-center px-4"
        style={{
          transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Logo/Icon */}
        <div className="text-8xl mb-6 float-animation">
          ♻️
        </div>

        {/* App Name */}
        <h1 className="text-6xl font-bold text-forest mb-4 fade-in-up">
          {t('app_name')}
        </h1>

        {/* Tagline */}
        <p className="text-2xl text-olive mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
          {t('tagline')}
        </p>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mb-8">
          <span className="text-3xl float-animation" style={{ animationDelay: '0.2s' }}>🌿</span>
          <span className="text-3xl float-animation" style={{ animationDelay: '0.4s' }}>🌍</span>
          <span className="text-3xl float-animation" style={{ animationDelay: '0.6s' }}>💚</span>
        </div>

        {/* CTA Button */}
        {showCTA && (
          <button
            onClick={handleEnterApp}
            className="btn-primary text-xl px-12 py-4 fade-in-up shadow-2xl transform hover:scale-105"
            style={{ animationDelay: '0.5s' }}
          >
            {t('enter_app')} →
          </button>
        )}
      </div>

      {/* Leaf Accent in Corner */}
      <div
        className="absolute top-10 right-10 text-6xl opacity-30 float-animation"
        style={{
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px) rotate(${mousePos.x * 0.5}deg)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        🍂
      </div>
      <div
        className="absolute bottom-20 left-10 text-6xl opacity-30 float-animation"
        style={{
          transform: `translate(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px) rotate(${-mousePos.x * 0.5}deg)`,
          transition: 'transform 0.3s ease-out',
          animationDelay: '1s',
        }}
      >
        🌿
      </div>
    </div>
  );
};

export default SplashParallax;
