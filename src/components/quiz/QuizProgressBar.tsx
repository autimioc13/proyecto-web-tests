'use client';

import { useEffect, useState } from 'react';

interface QuizProgressBarProps {
  current: number;
  total: number;
  animated?: boolean;
}

export default function QuizProgressBar({
  current,
  total,
  animated = true,
}: QuizProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const percentage = (current / total) * 100;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayProgress(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className="w-full">
      <style>{`
        @keyframes progressPulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
      `}</style>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-900">
          Pregunta {current} de {total}
        </h3>
        <span className="text-sm font-semibold text-purple-600">
          {Math.round(displayProgress)}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 ease-out"
          style={{
            width: `${displayProgress}%`,
            animation: displayProgress > 0 ? 'progressPulse 2s infinite' : 'none',
          }}
        />
      </div>
    </div>
  );
}
