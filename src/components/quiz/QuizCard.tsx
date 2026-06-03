'use client';

interface QuizCardProps {
  question: string;
  children: React.ReactNode;
  animated?: boolean;
}

export default function QuizCard({
  question,
  children,
  animated = true,
}: QuizCardProps) {
  return (
    <div className={`bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
      animated ? 'animate-slideIn' : ''
    }`}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
        {question}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
