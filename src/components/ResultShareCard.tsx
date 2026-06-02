'use client';

import { Share2, Copy, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ResultShareCardProps {
  score: number;
  total: number;
  quizName: string;
  resultEmoji?: string;
  resultTitle?: string;
}

export default function ResultShareCard({
  score,
  total,
  quizName,
  resultEmoji = '🎉',
  resultTitle = 'Resultado',
}: ResultShareCardProps) {
  const [copied, setCopied] = useState(false);
  const percentage = Math.round((score / total) * 100);
  const shareText = `¡Obtuve ${score}/${total} (${percentage}%) en "${quizName}" ${resultEmoji}! ¿Cuál es tu resultado?`;

  const handleCopy = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        await navigator.share({
          title: `Resultado: ${quizName}`,
          text: shareText,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{resultEmoji}</div>
        <h3 className="text-2xl font-bold text-gray-900">{resultTitle}</h3>
        <p className="text-gray-600 mt-2">{quizName}</p>
      </div>

      {/* Score Display */}
      <div className="bg-white rounded-xl p-6 mb-6 text-center border border-purple-100">
        <div className="flex justify-center gap-4 mb-4">
          <div>
            <p className="text-4xl font-bold text-purple-600">{percentage}%</p>
            <p className="text-sm text-gray-600">Puntuación</p>
          </div>
          <div className="border-l-2 border-gray-200"></div>
          <div>
            <p className="text-4xl font-bold text-blue-600">{score}/{total}</p>
            <p className="text-sm text-gray-600">Respuestas</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
        >
          <Share2 size={20} />
          Compartir Resultado
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
        >
          <MessageCircle size={20} />
          Enviar por WhatsApp
        </button>

        <button
          onClick={handleCopy}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
        >
          <Copy size={20} />
          {copied ? '¡Copiado!' : 'Copiar Enlace'}
        </button>
      </div>

      {/* Shareable Text Preview */}
      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Texto a compartir:</p>
        <p className="text-sm font-medium text-gray-900">{shareText}</p>
      </div>
    </div>
  );
}
