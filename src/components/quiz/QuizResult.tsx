'use client';

import { Quiz, ResultPacket } from '@/types';
import ShareButton from '@/components/ShareButton';
import AdSlot from '@/components/AdSlot';
import { TrendingUp, Award, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSoundContext } from '@/lib/contexts/SoundContext';

interface QuizResultProps {
  quiz: Quiz;
  result: ResultPacket;
  onRestart: () => void;
  onShare: () => void;
  levelUpTriggered?: boolean;
}

export default function QuizResult({
  quiz,
  result,
  onRestart,
  onShare,
  levelUpTriggered = false,
}: QuizResultProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { playSound } = useSoundContext();

  useEffect(() => {
    onShare();
  }, [onShare]);

  // Play level-up sound when triggered
  useEffect(() => {
    if (levelUpTriggered) {
      playSound('levelUp', 0.8);
    }
  }, [levelUpTriggered, playSound]);

  return (
    <div className="space-y-8">
      {/* Result Card - HERO SECTION */}
      <div className="bg-white/10 dark:bg-white/5 rounded-2xl shadow-2xl p-8 sm:p-12 text-gray-900 dark:text-white text-center relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="text-8xl mb-6 animate-bounce">{result.result.emoji}</div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">{result.result.title}</h1>

          <div className="inline-block bg-white/20 dark:bg-white/10 backdrop-blur-lg px-6 py-2 rounded-full mb-8 border border-white/30">
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{result.rarityLabel}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Nivel de Confianza</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{result.confidence.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full h-3">
              <div
                className="bg-gray-400 dark:bg-gray-300 h-3 rounded-full transition-all duration-500"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          <p className="text-lg text-gray-800 dark:text-gray-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            {result.result.description}
          </p>

          {result.secondaryProfile && (
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-lg p-6 mb-8 max-w-md mx-auto border border-white/20">
              <p className="text-xs font-semibold opacity-75 mb-2 text-gray-900 dark:text-white">PERFIL SECUNDARIO</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{result.secondaryProfile.emoji} {result.secondaryProfile.title}</p>
            </div>
          )}

          {result.recommendation && (
            <div className="bg-white/15 dark:bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Heart className="mt-1 flex-shrink-0 text-gray-700 dark:text-gray-300" size={20} />
                <div>
                  <p className="font-semibold mb-1 text-gray-900 dark:text-white">Recomendación personalizada:</p>
                  <p className="text-sm opacity-90 text-gray-800 dark:text-gray-200">{result.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {result.scoreBreakdown && Object.keys(result.scoreBreakdown).length > 0 && (
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp size={28} className="text-gray-700 dark:text-gray-300" />
            Desglose de Resultados
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(result.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="bg-white/15 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold mb-2 capitalize">{key}</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.result.offer && (
        <div className="bg-white/10 dark:bg-white/5 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white text-center relative overflow-hidden border border-white/20">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">🎁 Oferta Especial</h3>
            <p className="text-lg mb-6">{result.result.offer.copy}</p>
            <a
              href={result.result.offer.url}
              className="inline-block bg-white/20 dark:bg-white/10 backdrop-blur-sm text-gray-900 dark:text-white font-bold py-3 px-8 rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition border border-white/30"
            >
              Ver Oferta →
            </a>
          </div>
        </div>
      )}

      {/* AD SLOT Premium */}
      <div>
        <AdSlot slotId={`quiz_${quiz.slug}_result_top`} style="banner" />
      </div>

      {/* Share Section */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">¡Comparte tu resultado!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Muestrale a tus amigos quién eres realmente</p>
        <ShareButton
          text={result.result.shareText}
          title={`Resultado de ${quiz.title}`}
        />
      </div>

      {/* AD SLOT Cierre */}
      <div>
        <AdSlot slotId={`quiz_${quiz.slug}_result_bottom`} style="banner" />
      </div>

      {/* Restart Button */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={onRestart} className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-lg text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-white/30 dark:hover:bg-white/15 transition-all border border-white/20 shadow-md hover:shadow-lg">
          Repetir Test
        </button>
        <Link href="/" className="inline-block px-6 py-3 bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-white/30 dark:hover:bg-white/15 hover:shadow-lg transition-all border border-white/20 backdrop-blur-sm">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
