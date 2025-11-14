import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#faf8f3' }}>
      
      {/* Hero Section with Modern Graphics */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Organic Blob Shapes */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5 animate-float" style={{
            background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
            filter: 'blur(40px)'
          }}></div>
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-5 animate-float-delayed" style={{
            background: 'linear-gradient(135deg, #87a878 0%, #b4d4a5 100%)',
            filter: 'blur(60px)'
          }}></div>
          <div className="absolute bottom-32 left-1/4 w-80 h-80 rounded-full opacity-5 animate-float" style={{
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
            filter: 'blur(50px)'
          }}></div>
          
          {/* Decorative Lines/Patterns */}
          <svg className="absolute top-1/4 right-10 w-64 h-64 opacity-5" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#4a7c2c" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="#87a878" strokeWidth="2" />
          </svg>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Logo/Brand - Modern Icon */}
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
                boxShadow: '0 20px 60px rgba(45, 80, 22, 0.3)',
                animation: 'pulse-gentle 3s ease-in-out infinite'
              }}>
                {/* Recycling Icon - Custom SVG */}
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {/* Decorative Corner Accent */}
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.3)' }}></div>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ 
            color: '#2d5016',
            lineHeight: '1.2',
            textShadow: '3px 3px 0px rgba(135, 168, 120, 0.15)'
          }}>
            Transform Waste Into
            <span className="block mt-2" style={{
              background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Worth & Wonder
            </span>
          </h1>

          {/* Environmental Graphic - Small & Centered */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="rounded-2xl overflow-hidden" style={{
              boxShadow: '0 10px 30px rgba(45, 80, 22, 0.15)'
            }}>
              <img 
                src="/assets/environ.png" 
                alt="AI-Powered Environmental Technology"
                className="w-full h-auto"
                style={{
                  display: 'block',
                  animation: 'scale-in 0.8s ease-out'
                }}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              to="/home"
              className="px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(45, 80, 22, 0.3)'
              }}
            >
              Get Started →
            </Link>
            <a 
              href="#features"
              className="px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105"
              style={{
                background: 'white',
                color: '#2d5016',
                border: '3px solid #e8dfd0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
            >
              Learn More
            </a>
          </div>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#5f7c4d' }}>
            Smart recycling powered by AI. Scan, earn rewards, and make a lasting impact on our planet—one item at a time.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ), 
                value: '10K+', 
                label: 'Items Recycled' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                value: '5T+', 
                label: 'CO₂ Saved' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ), 
                value: '2K+', 
                label: 'Active Users' 
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ), 
                value: '50+', 
                label: 'Recyclers' 
              }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{
                background: 'white',
                border: '2px solid #e8dfd0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="mb-3" style={{ color: '#4a7c2c' }}>{stat.icon}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#2d5016' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#5f7c4d' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6" style={{ color: '#87a878' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6" style={{ background: '#faf8f3' }}>
      </section>

      {/* Full-Width Environmental Graphic Section */}
      /* <section className="py-16 px-6 md:px-12" style={{ 
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #e8f5e9 100%)' 
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden" style={{
            boxShadow: '0 20px 60px rgba(45, 80, 22, 0.2)'
          }}>
            <img 
              src="/assets/environ.png" 
              alt="AI-Powered Environmental Technology"
              className="w-full h-auto"
              style={{
                display: 'block',
                animation: 'scale-in 1s ease-out'
              }}
            />
          </div>
          
          {/* Caption Below Image */}
          <div className="text-center mt-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#2d5016' }}>
              Where Technology Meets Sustainability
            </h3>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5f7c4d' }}>
              Our AI-powered platform combines computer vision, natural language processing, and smart routing 
              to make recycling effortless, rewarding, and impactful for everyone.
            </p>
          </div>
        </div>
      </section> 

      {/* Features Section */}
      <section id="features" className="py-24 px-6" style={{ 
        background: 'linear-gradient(180deg, #faf8f3 0%, rgba(180, 212, 165, 0.1) 100%)' 
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2d5016' }}>
              How ReNova Works
            </h2>
            <p className="text-xl" style={{ color: '#5f7c4d' }}>
              Simple, smart, and sustainable recycling in three steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                number: '01',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Scan or Ask',
                description: 'Take a photo of your waste or use voice to describe it. Our AI instantly identifies the material and cleanliness.'
              },
              {
                number: '02',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Get Smart Guidance',
                description: 'Receive personalized disposal instructions, environmental impact data, and earn token estimates.'
              },
              {
                number: '03',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Find & Recycle',
                description: 'Locate nearby recyclers ranked by distance and quality. Drop off your items and earn real rewards!'
              }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="p-8 rounded-3xl h-full transition-all duration-300 group-hover:scale-105" style={{
                  background: 'white',
                  border: '3px solid #e8dfd0',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)'
                }}>
                  {/* Number Badge */}
                  <div className="absolute -top-6 -left-6 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{
                    background: 'linear-gradient(135deg, #4a7c2c 0%, #87a878 100%)',
                    boxShadow: '0 6px 20px rgba(74, 124, 44, 0.3)'
                  }}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 mt-4" style={{ color: '#4a7c2c' }}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#2d5016' }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#5f7c4d' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 px-6" style={{ background: '#faf8f3' }}>
        <div className="max-w-6xl mx-auto">
          <div className="p-12 md:p-16 rounded-3xl relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
            boxShadow: '0 20px 60px rgba(45, 80, 22, 0.3)'
          }}>
            {/* Decorative Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)'
            }}></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{
              background: 'radial-gradient(circle, white 0%, transparent 70%)'
            }}></div>

            <div className="relative z-10 text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Actions, Real Impact
              </h2>
              <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
                Every scan contributes to a cleaner planet. Track your environmental footprint and see how your recycling efforts add up.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                  { 
                    icon: (
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    ), 
                    label: 'CO₂ Emissions', 
                    value: 'Reduced' 
                  },
                  { 
                    icon: (
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    ), 
                    label: 'Water', 
                    value: 'Conserved' 
                  },
                  { 
                    icon: (
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ), 
                    label: 'Landfill Waste', 
                    value: 'Diverted' 
                  }
                ].map((impact, i) => (
                  <div key={i} className="p-6 rounded-2xl" style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div className="mb-3 flex justify-center text-white">{impact.icon}</div>
                    <div className="text-lg opacity-90 mb-1">{impact.label}</div>
                    <div className="text-2xl font-bold">{impact.value}</div>
                  </div>
                ))}
              </div>

              <Link 
                to="/home"
                className="inline-block px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105"
                style={{
                  background: 'white',
                  color: '#2d5016',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                }}
              >
                Start Making a Difference
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6" style={{ 
        background: 'linear-gradient(180deg, #faf8f3 0%, rgba(180, 212, 165, 0.05) 100%)' 
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2d5016' }}>
              Powered by Innovation
            </h2>
            <p className="text-xl" style={{ color: '#5f7c4d' }}>
              Advanced technology for effortless recycling
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'AI-Powered Recognition',
                description: 'Our advanced computer vision instantly identifies materials with 95%+ accuracy, even in challenging conditions.'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'Voice Assistant',
                description: 'Ask questions about recycling in natural language. Get instant answers from our knowledge base.'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
                title: 'Smart Routing',
                description: 'Find the nearest recycling centers ranked by distance, ratings, and material acceptance.'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Earn Rewards',
                description: 'Collect tokens for every item recycled. Redeem them for real-world benefits and exclusive perks.'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Impact Dashboard',
                description: 'Visualize your environmental contribution with detailed metrics and lifetime statistics.'
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Multilingual Support',
                description: 'Access ReNova in your preferred language with full English and Hindi support.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl transition-all hover:scale-105" style={{
                background: 'white',
                border: '2px solid #e8dfd0',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0" style={{ color: '#4a7c2c' }}>{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#2d5016' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#5f7c4d' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6" style={{ background: '#faf8f3' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#4a7c2c' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#2d5016' }}>
            Ready to Transform Your Waste?
          </h2>
          <p className="text-xl mb-10" style={{ color: '#5f7c4d' }}>
            Join thousands making a positive impact on the environment
          </p>
          <Link 
            to="/home"
            className="inline-block px-12 py-6 rounded-full font-bold text-xl transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4a7c2c 0%, #2d5016 100%)',
              color: 'white',
              boxShadow: '0 10px 40px rgba(45, 80, 22, 0.3)'
            }}
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-6 border-t" style={{ 
        background: '#faf8f3',
        borderColor: '#e8dfd0'
      }}>
        <div className="max-w-6xl mx-auto text-center" style={{ color: '#5f7c4d' }}>
          <p>© 2025 ReNova. Making recycling simple and rewarding.</p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
