import React, { useState, useEffect } from 'react';
import { Card, Badge } from './ReactBits';
import { useTranslation } from '../../node_modules/react-i18next';

const ImpactCard = ({ icon, label, value, unit, color = 'forest' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className={`text-3xl font-bold text-${color} count-up mb-2`}>
        {animatedValue.toFixed(1)} {unit}
      </div>
      <div className="text-gray-600 font-semibold">{label}</div>
    </Card>
  );
};

export const ImpactGraph = ({ data, type = 'bar' }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <Card>
        <h3 className="text-xl font-bold text-forest mb-4">{t('impact.weekly')}</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative">
                <div
                  className="bg-forest rounded-t-lg transition-all duration-1000 ease-out"
                  style={{
                    height: `${(item.value / maxValue) * 180}px`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (type === 'line') {
    return (
      <Card>
        <h3 className="text-xl font-bold text-forest mb-4">{t('impact.monthly')}</h3>
        <div className="relative h-48">
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <polyline
              points={data.map((item, i) => 
                `${(i / (data.length - 1)) * 280 + 10},${140 - (item.value / maxValue) * 120}`
              ).join(' ')}
              fill="none"
              stroke="#2f5233"
              strokeWidth="3"
            />
            {data.map((item, i) => (
              <circle
                key={i}
                cx={(i / (data.length - 1)) * 280 + 10}
                cy={140 - (item.value / maxValue) * 120}
                r="4"
                fill="#2f5233"
              />
            ))}
          </svg>
          <div className="flex justify-between mt-2">
            {data.map((item, index) => (
              <div key={index} className="text-xs text-gray-600 text-center">
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (type === 'donut') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    return (
      <Card>
        <h3 className="text-xl font-bold text-forest mb-4">{t('impact.category')}</h3>
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const endAngle = currentAngle + angle;
              
              const startX = 100 + 60 * Math.cos((currentAngle * Math.PI) / 180);
              const startY = 100 + 60 * Math.sin((currentAngle * Math.PI) / 180);
              const endX = 100 + 60 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 100 + 60 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${startX} ${startY}`,
                `A 60 60 0 ${largeArc} 1 ${endX} ${endY}`,
                `Z`
              ].join(' ');
              
              currentAngle = endAngle;
              
              const colors = ['#2f5233', '#afc3a2', '#5a7a5e', '#7d9d80', '#9eb89d'];
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                />
              );
            })}
            <circle cx="100" cy="100" r="40" fill="#f5f0e6" />
          </svg>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const colors = ['bg-forest', 'bg-olive', 'bg-green-700', 'bg-green-500', 'bg-green-300'];
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-semibold">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return null;
};

export default ImpactCard;
