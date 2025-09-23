import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const CustomToast = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Icon mapping
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  // Color mapping
  const colors = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      progress: 'bg-blue-500'
    }
  };

  const IconComponent = icons[type];
  const colorScheme = colors[type];

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          handleClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Match the fade-out animation duration
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  // Calculate progress percentage
  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  if (!isVisible) return null;

  return (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        min-w-80 max-w-md w-full shadow-xl rounded-lg border-l-4 overflow-hidden
        ${colorScheme.bg}
        transform transition-all duration-300 ease-in-out
        hover:scale-102 hover:shadow-2xl
        border border-gray-200
      `}>
        {/* Main content */}
        <div className="p-5">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <IconComponent className={`h-6 w-6 ${colorScheme.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-5 ${colorScheme.text} break-words`}>
                {message}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button
                className={`
                  inline-flex items-center justify-center w-8 h-8 rounded-full
                  ${colorScheme.text} hover:bg-black hover:bg-opacity-10 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                  transition-all duration-200 group
                `}
                onClick={handleClose}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="relative h-8 flex items-center bg-gray-50 bg-opacity-30">
          {/* Background bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 bg-opacity-50"></div>
          
          {/* Progress bar */}
          <div 
            className={`absolute bottom-0 left-0 h-2 transition-all duration-100 ease-linear ${colorScheme.progress}`}
            style={{ 
              width: `${progressPercentage}%`,
              transition: isPaused ? 'none' : 'width 100ms linear'
            }}
          />
          
          {/* Time indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className={`text-xs font-medium ${colorScheme.text} opacity-80`}>
              {Math.ceil(timeLeft / 1000)}s
            </span>
          </div>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute top-2 left-2">
            <div className={`text-xs px-2 py-1 rounded-full bg-black bg-opacity-20 backdrop-blur-sm ${colorScheme.text} font-medium shadow-sm`}>
              ⏸️ Paused
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomToast;