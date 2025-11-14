import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for 2.5 seconds then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #87a878 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Rotating recycle symbol */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              boxShadow: '0 0 60px 20px rgba(180, 212, 165, 0.4)',
              transform: 'scale(1.3)',
            }}
          />
          
          {/* Spinning ring */}
          <div
            className="absolute inset-0 border-4 border-transparent border-t-white/30 rounded-full animate-spin"
            style={{
              width: '140px',
              height: '140px',
              transform: 'translate(-70px, -70px)',
              animationDuration: '2s',
            }}
          />

          {/* Recycle symbol */}
          <div
            className="relative w-28 h-28 flex items-center justify-center animate-spin"
            style={{
              animationDuration: '3s',
              filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
            }}
          >
            {/* Triangle paths - creates the iconic recycle symbol */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bottom left arrow */}
              <path
                d="M 30 70 L 15 75 L 25 85 L 30 70 M 30 70 L 50 30"
                fill="white"
                className="animate-pulse"
                style={{ animationDelay: '0s', animationDuration: '1.5s' }}
              />
              
              {/* Top arrow */}
              <path
                d="M 50 15 L 45 0 L 55 0 L 50 15 M 50 15 L 70 55"
                fill="white"
                className="animate-pulse"
                style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}
              />
              
              {/* Bottom right arrow */}
              <path
                d="M 85 75 L 100 70 L 95 85 L 85 75 M 85 75 L 30 70"
                fill="white"
                className="animate-pulse"
                style={{ animationDelay: '1s', animationDuration: '1.5s' }}
              />
              
              {/* Triangle curves connecting arrows */}
              <path
                d="M 30 70 Q 40 50 50 30"
                fill="none"
                stroke="white"
                strokeWidth="4"
                className="animate-pulse"
              />
              <path
                d="M 50 15 Q 60 35 70 55"
                fill="none"
                stroke="white"
                strokeWidth="4"
                className="animate-pulse"
              />
              <path
                d="M 85 75 Q 57 72 30 70"
                fill="none"
                stroke="white"
                strokeWidth="4"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        {/* App name with fade-in animation */}
        <div className="text-center animate-fade-in">
          <h1
            className="text-5xl font-bold text-white mb-2"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.8s ease-out',
            }}
          >
            ReNova
          </h1>
          <p
            className="text-white/80 text-lg"
            style={{
              animation: 'slideUp 0.8s ease-out 0.2s both',
            }}
          >
            Nature meets Technology
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-white"
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
