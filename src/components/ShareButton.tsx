'use client';

import { Share2, MessageCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  text: string;
  title: string;
}

export default function ShareButton({ text, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${window.location.href}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleShare}
        className="btn-secondary flex items-center gap-2"
      >
        <Share2 size={20} />
        Compartir
      </button>
      <button
        onClick={handleWhatsApp}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition"
      >
        <MessageCircle size={20} />
        WhatsApp
      </button>
      <button
        onClick={handleCopy}
        className="btn-secondary flex items-center gap-2"
      >
        <Copy size={20} />
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}
