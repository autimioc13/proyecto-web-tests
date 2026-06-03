import { AggregatedMetrics } from '@/types';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface DiagnosticBoxProps {
  metrics: AggregatedMetrics[];
}

export default function DiagnosticBox({ metrics }: DiagnosticBoxProps) {
  const diagnostics: Array<{ level: 'warning' | 'info'; message: string }> = [];

  metrics.forEach((m) => {
    if (m.totalStarts > 0 && m.completionRate < 30) {
      diagnostics.push({
        level: 'warning',
        message: `${m.quizSlug}: Baja tasa de completación (${m.completionRate}%). Considera acortar el test o mejorar el copy.`,
      });
    }

    if (m.totalCompletes > 10 && m.shareRate < 20) {
      diagnostics.push({
        level: 'info',
        message: `${m.quizSlug}: Pocas comparticiones (${m.shareRate}%). Mejora el copy del resultado o los botones de share.`,
      });
    }

    if (m.rpm > 10000000) {
      diagnostics.push({
        level: 'info',
        message: `${m.quizSlug}: ¡Excelente RPM! Crea más tests como este.`,
      });
    }
  });

  if (diagnostics.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:bg-white/15 dark:hover:bg-white/10 transition-all">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Lightbulb size={20} />
        Diagnóstico Automático
      </h3>

      <div className="space-y-3">
        {diagnostics.map((diag, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            <AlertCircle
              size={16}
              className="flex-shrink-0 mt-0.5 text-gray-700 dark:text-gray-300"
            />
            <p className="text-gray-700 dark:text-gray-300">{diag.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
