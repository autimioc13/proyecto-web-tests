'use client';

import { useState } from 'react';
import { Sparkles, Send, Download, Upload } from 'lucide-react';

interface GenerationResult {
  csv: string;
  quizzes: Array<{
    quiz: any;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  count: number;
}

export default function AITestGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Por favor describe los tests que deseas crear');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al generar tests');
        setLoading(false);
        return;
      }

      const data: GenerationResult = await response.json();
      setResult(data);
      setError('');
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(result.csv));
    element.setAttribute('download', `generated-${Date.now()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = async () => {
    if (!result) return;

    // Guardar CSV y JSON
    const timestamp = Date.now();
    const jsonQuizzes = result.quizzes.filter(r => r.valid).map(r => r.quiz);

    if (jsonQuizzes.length === 0) {
      setError('No hay tests válidos para importar');
      return;
    }

    try {
      // Hacer POST a un endpoint de importación
      const importResponse = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizzes: jsonQuizzes }),
      });

      if (!importResponse.ok) {
        const data = await importResponse.json();
        setError(data.error || 'Error al importar');
        return;
      }

      alert(`✅ ${jsonQuizzes.length} tests importados correctamente!\n\nAhora corre: npm run build`);
      setResult(null);
      setPrompt('');
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-purple-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Generador de Tests con IA</h2>
        </div>
        <p className="text-gray-600">
          Describe los tests que deseas crear. Claude IA genera el CSV validado automáticamente.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Describe los tests a crear
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ejemplo: 20 tests de personalidad sobre qué tipo de viajero eres, con 6 preguntas cada uno y 4 resultados diferentes..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Sé específico: número de tests, tipo (personalidad/trivia/curiosidades/útil), tema
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⚡</span>
              Generando con IA...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generar Tests
            </>
          )}
        </button>
      </div>

      {/* Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">❌ Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Resultados */}
      {result && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-lg font-bold text-green-800 mb-3">✅ Tests Generados Correctamente</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{result.count}</p>
                <p className="text-sm text-gray-600">Tests Totales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {result.quizzes.filter(r => r.valid).length}
                </p>
                <p className="text-sm text-gray-600">Válidos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {result.quizzes.filter(r => !r.valid).length}
                </p>
                <p className="text-sm text-gray-600">Con Errores</p>
              </div>
            </div>
          </div>

          {/* Detalles de cada quiz */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Detalles por Quiz</h3>
            {result.quizzes.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-4 border-l-4 ${
                  item.valid
                    ? 'bg-green-50 border-l-green-500'
                    : 'bg-red-50 border-l-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.quiz.emoji} {item.quiz.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quiz.questions.length} preguntas • {item.quiz.results.length} resultados
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.valid
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {item.valid ? '✅ Válido' : '❌ Error'}
                  </span>
                </div>

                {item.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.errors.map((error, i) => (
                      <p key={i} className="text-xs text-red-700">
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {item.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.warnings.map((warning, i) => (
                      <p key={i} className="text-xs text-yellow-700">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadCSV}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Descargar CSV
            </button>

            <button
              onClick={handleImport}
              disabled={result.quizzes.filter(r => r.valid).length === 0}
              className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Importar al Store
            </button>
          </div>

          {/* Vista Previa CSV */}
          <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <summary className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700">
              📋 Ver CSV Generado
            </summary>
            <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto">
              {result.csv}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
