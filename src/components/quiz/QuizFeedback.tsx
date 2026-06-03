'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizFeedbackProps {
  visible: boolean;
  isCorrect: boolean;
  message: string;
}

export default function QuizFeedback({
  visible,
  isCorrect,
  message,
}: QuizFeedbackProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none flex items-center justify-center ${
        isCorrect ? 'animate-correctFeedback' : 'animate-incorrectFeedback'
      }`}
    >
      <style>{`
        @keyframes correctFeedback {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
        @keyframes incorrectFeedback {
          0%, 100% {
            opacity: 1;
            transform: translateX(0);
          }
          10%, 90% {
            transform: translateX(-10px);
          }
          20%, 80% {
            transform: translateX(10px);
          }
          30%, 70% {
            transform: translateX(-10px);
          }
          40%, 60% {
            transform: translateX(10px);
          }
          50% {
            transform: translateX(0);
          }
        }
        .animate-correctFeedback {
          animation: correctFeedback 0.8s ease-out forwards;
        }
        .animate-incorrectFeedback {
          animation: incorrectFeedback 0.6s ease-in-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center gap-4">
        {isCorrect ? (
          <>
            <CheckCircle size={64} className="text-green-500 drop-shadow-lg" />
            <div className="bg-green-500/80 backdrop-blur-lg text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-center border border-green-400/50">
              {message || '¡Correcto!'}
            </div>
          </>
        ) : (
          <>
            <XCircle size={64} className="text-red-500 drop-shadow-lg" />
            <div className="bg-red-500/80 backdrop-blur-lg text-white px-6 py-3 rounded-lg font-semibold shadow-lg text-center border border-red-400/50">
              {message || 'Incorrecto'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
