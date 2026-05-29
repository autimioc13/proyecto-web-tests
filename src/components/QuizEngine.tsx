'use client';

import { Quiz, ResultPacket } from '@/types';
import { useState, useCallback } from 'react';
import QuizIntro from './quiz/QuizIntro';
import QuizQuestion from './quiz/QuizQuestion';
import QuizResult from './quiz/QuizResult';
import { useAnalytics } from '@/hooks/useAnalytics';
import { calculateResult } from '@/engine/engine';

type QuizState = 'intro' | 'question' | 'result';

interface QuizEngineProps {
  quiz: Quiz;
}

export default function QuizEngine({ quiz }: QuizEngineProps) {
  const [state, setState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<ResultPacket | null>(null);
  const { trackEvent } = useAnalytics();

  const handleStart = useCallback(() => {
    setState('question');
    trackEvent('quiz_start', quiz.slug, {
      quiz_title: quiz.title,
      quiz_type: quiz.type,
    });
  }, [quiz.slug, quiz.title, quiz.type, trackEvent]);

  const handleSelectOption = useCallback(
    (optionId: string) => {
      const newAnswers = new Map(answers);
      newAnswers.set(quiz.questions[currentQuestionIndex].id, optionId);
      setAnswers(newAnswers);

      trackEvent('quiz_question_view', quiz.slug, {
        question_index: currentQuestionIndex,
        question_id: quiz.questions[currentQuestionIndex].id,
        selected_option: optionId,
      });
    },
    [answers, currentQuestionIndex, quiz.slug, quiz.questions, trackEvent]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const calculatedResult = calculateResult(quiz, answers);
      setResult(calculatedResult);
      setState('result');

      trackEvent('quiz_complete', quiz.slug, {
        total_questions: quiz.questions.length,
        answered_questions: answers.size,
        result_id: calculatedResult.result.id || 'unknown',
      });
    }
  }, [currentQuestionIndex, quiz, answers, trackEvent]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setResult(null);
    setState('intro');

    trackEvent('quiz_restart', quiz.slug, {});
  }, [quiz.slug, trackEvent]);

  const handleShare = useCallback(() => {
    trackEvent('quiz_share', quiz.slug, {
      result_id: result?.result.id || 'unknown',
    });
  }, [quiz.slug, result, trackEvent]);

  const handleAbandon = useCallback(() => {
    trackEvent('quiz_abandon', quiz.slug, {
      abandoned_at_question: currentQuestionIndex,
      answered_questions: answers.size,
    });
  }, [quiz.slug, currentQuestionIndex, answers.size, trackEvent]);

  if (state === 'intro') {
    return <QuizIntro quiz={quiz} onStart={handleStart} />;
  }

  if (state === 'question') {
    return (
      <QuizQuestion
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={quiz.questions.length}
        onSelectOption={handleSelectOption}
        onNext={handleNextQuestion}
        onAbandon={handleAbandon}
        selectedOption={answers.get(quiz.questions[currentQuestionIndex]?.id)}
      />
    );
  }

  if (state === 'result' && result) {
    return (
      <QuizResult
        quiz={quiz}
        result={result}
        onRestart={handleRestart}
        onShare={handleShare}
      />
    );
  }

  return null;
}
