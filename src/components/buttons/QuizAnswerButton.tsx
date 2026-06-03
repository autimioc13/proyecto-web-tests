'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface QuizAnswerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  letter: string;
  selected?: boolean;
  answered?: boolean;
  correct?: boolean;
  children: React.ReactNode;
}

export default function QuizAnswerButton({
  letter,
  selected = false,
  answered = false,
  correct,
  children,
  className = '',
  ...props
}: QuizAnswerButtonProps) {
  let borderColor = 'border-white/20';
  let bgColor = 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10';
  let textColor = 'text-gray-900 dark:text-white';

  if (answered) {
    if (correct) {
      borderColor = 'border-gray-500/50 dark:border-gray-400/50';
      bgColor = 'bg-white/20 dark:bg-white/10';
      textColor = 'text-gray-900 dark:text-white';
    } else {
      borderColor = 'border-gray-400/50 dark:border-gray-500/50';
      bgColor = 'bg-white/15 dark:bg-white/10';
      textColor = 'text-gray-900 dark:text-white';
    }
  } else if (selected) {
    borderColor = 'border-gray-500/60 dark:border-gray-400/60';
    bgColor = 'bg-white/20 dark:bg-white/10 shadow-lg shadow-gray-400/20 dark:shadow-gray-500/20';
    textColor = 'text-gray-900 dark:text-white';
  }

  return (
    <button
      className={`relative w-full p-4 rounded-lg text-left font-semibold transition-all duration-200 border-2 ${borderColor} ${bgColor} ${textColor} backdrop-blur-md ${className}`}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white font-bold border border-white/20">
          {letter}
        </div>
        <span className="flex-1">{children}</span>
        {answered && correct && <span className="text-xl">✅</span>}
        {answered && !correct && <span className="text-xl">❌</span>}
      </div>
    </button>
  );
}
