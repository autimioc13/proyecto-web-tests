'use client';

import { Quiz, ResultPacket } from '@/types';
import { useState, useCallback } from 'react';
import QuizIntro from './quiz/QuizIntro';
import QuizQuestion from './quiz/QuizQuestion';
import QuizResult from './quiz/QuizResult';
import { useAnalytics } from '@/hooks/useAnalytics';
import { calculateResult } from '@/engine/engine';
import { useSoundContext } from '@/lib/contexts/SoundContext';

type QuizState = 'intro' | 'question' | 'result';

interface QuizEngineProps {
  quiz: Quiz;
}

export default function QuizEngine({ quiz }: QuizEngineProps) {
  const [state, setState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<ResultPacket | null>(null);
  const [levelUpTriggered, setLevelUpTriggered] = useState(false);
  const { trackEvent } = useAnalytics();
  const { playSound } = useSoundContext();

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
      const currentQuestion = quiz.questions[currentQuestionIndex];
      newAnswers.set(currentQuestion.id, optionId);
      setAnswers(newAnswers);

      // Play sound feedback for answer selection (for trivia quizzes)
      const isCorrect = currentQuestion.correct && optionId === currentQuestion.correct;
      if (isCorrect) {
        playSound('correct', 0.7);
      } else if (currentQuestion.correct) {
        // Only play incorrect sound if this is a trivia quiz with correct answers
        playSound('incorrect', 0.6);
      }

      trackEvent('quiz_question_view', quiz.slug, {
        question_index: currentQuestionIndex,
        question_id: currentQuestion.id,
        selected_option: optionId,
      });
    },
    [answers, currentQuestionIndex, quiz.slug, quiz.questions, trackEvent, playSound]
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
    setLevelUpTriggered(false);
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
        levelUpTriggered={levelUpTriggered}
      />
    );
  }

  return null;
}
