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
  let borderColor = 'border-gray-300';
  let bgColor = 'bg-white hover:bg-gray-50';
  let textColor = 'text-gray-900';

  if (answered) {
    if (correct) {
      borderColor = 'border-green-500';
      bgColor = 'bg-green-50';
      textColor = 'text-green-900';
    } else {
      borderColor = 'border-red-500';
      bgColor = 'bg-red-50';
      textColor = 'text-red-900';
    }
  } else if (selected) {
    borderColor = 'border-purple-600';
    bgColor = 'bg-purple-50';
    textColor = 'text-purple-900';
  }

  return (
    <button
      className={`relative w-full p-4 rounded-lg text-left font-semibold transition-all duration-200 border-2 ${borderColor} ${bgColor} ${textColor} ${className}`}
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
