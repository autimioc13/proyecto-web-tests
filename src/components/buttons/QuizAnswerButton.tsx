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
      borderColor = 'border-green-500/50';
      bgColor = 'bg-green-500/20 dark:bg-green-500/10';
      textColor = 'text-green-900 dark:text-green-100';
    } else {
      borderColor = 'border-red-500/50';
      bgColor = 'bg-red-500/20 dark:bg-red-500/10';
      textColor = 'text-red-900 dark:text-red-100';
    }
  } else if (selected) {
    borderColor = 'border-purple-500/60';
    bgColor = 'bg-purple-500/20 dark:bg-purple-500/10 shadow-lg shadow-purple-500/20';
    textColor = 'text-purple-900 dark:text-purple-100';
  }

  return (
    <button
      className={`relative w-full p-4 rounded-lg text-left font-semibold transition-all duration-200 border-2 ${borderColor} ${bgColor} ${textColor} backdrop-blur-md ${className}`}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold">
          {letter}
        </div>
        <span className="flex-1">{children}</span>
        {answered && correct && <span className="text-xl">✅</span>}
        {answered && !correct && <span className="text-xl">❌</span>}
      </div>
    </button>
  );
}
