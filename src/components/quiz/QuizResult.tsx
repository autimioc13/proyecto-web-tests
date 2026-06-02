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
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl p-8 sm:p-12 text-white text-center">
        <div className="text-8xl mb-6 animate-bounce">{result.result.emoji}</div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4">{result.result.title}</h1>

        <div className="inline-block bg-white bg-opacity-20 backdrop-blur px-6 py-2 rounded-full mb-8">
          <p className="text-sm sm:text-base font-semibold">{result.rarityLabel}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Nivel de Confianza</span>
            <span className="text-lg font-bold">{result.confidence.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        <p className="text-lg text-white text-opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
          {result.result.description}
        </p>

        {result.secondaryProfile && (
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 mb-8 max-w-md mx-auto">
            <p className="text-xs font-semibold opacity-75 mb-2">PERFIL SECUNDARIO</p>
            <p className="text-xl font-bold">{result.secondaryProfile.emoji} {result.secondaryProfile.title}</p>
          </div>
        )}

        {result.recommendation && (
          <div className="bg-yellow-100 bg-opacity-20 border border-yellow-300 border-opacity-30 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Heart className="mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold mb-1">Recomendación personalizada:</p>
                <p className="text-sm opacity-90">{result.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {result.scoreBreakdown && Object.keys(result.scoreBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={28} className="text-blue-600" />
            Desglose de Resultados
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(result.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm font-semibold mb-2 capitalize">{key}</p>
                <p className="text-3xl font-bold text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.result.offer && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">🎁 Oferta Especial</h3>
          <p className="text-lg mb-6">{result.result.offer.copy}</p>
          <a
            href={result.result.offer.url}
            className="inline-block bg-white text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            Ver Oferta →
          </a>
        </div>
      )}

      {/* AD SLOT Premium */}
      <div>
        <AdSlot slotId={`quiz_${quiz.slug}_result_top`} style="banner" />
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">¡Comparte tu resultado!</h2>
        <p className="text-gray-600 mb-6">Muestrale a tus amigos quién eres realmente</p>
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
      <div className="flex gap-4 justify-center">
        <button onClick={onRestart} className="btn-secondary">
          Repetir Test
        </button>
        <Link href="/" className="btn-primary bg-blue-600 text-white">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
