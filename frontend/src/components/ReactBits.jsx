import React from 'react';

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-2xl' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-hazard text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90',
    outline: 'border-2 border-forest text-forest px-6 py-3 rounded-lg font-semibold hover:bg-forest hover:text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-forest">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  label,
  className = '',
  required = false
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-hazard">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-forest focus:outline-none transition-colors"
      />
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-olive text-forest',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-hazard',
    primary: 'bg-forest text-white',
  };

  return (
    <span className={`${variants[variant]} px-3 py-1 rounded-full text-sm font-semibold ${className}`}>
      {children}
    </span>
  );
};

export const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-olive ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-forest font-bold">
          {alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
};

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`${sizes[size]} border-forest border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    success: 'bg-green-500',
    error: 'bg-hazard',
    info: 'bg-forest',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`${types[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-xl font-bold">×</button>
    </div>
  );
};

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b-2 border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === tab.id
              ? 'border-b-4 border-forest text-forest'
              : 'text-gray-500 hover:text-forest'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export const Icon = ({ name, size = 24, className = '' }) => {
  // Simple icon placeholders - in production, use a library like react-icons
  const icons = {
    camera: '📷',
    mic: '🎤',
    map: '🗺️',
    leaf: '🍃',
    coin: '🪙',
    trophy: '🏆',
    recycle: '♻️',
    warning: '⚠️',
    check: '✓',
    close: '×',
    menu: '☰',
    user: '👤',
    settings: '⚙️',
  };

  return (
    <span className={`inline-block ${className}`} style={{ fontSize: size }}>
      {icons[name] || '•'}
    </span>
  );
};
