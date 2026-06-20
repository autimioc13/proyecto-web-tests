import { Metadata, Viewport } from 'next';
import { getAllProducts, formatPrice } from '@/lib/products';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Precios | QuizLab',
  description:
    'Productos digitales de QuizLab: reportes de personalidad, cursos, certificados y paquetes. Precios en USD; tu moneda local se calcula al pagar.',
};

const CATEGORY_LABELS: Record<string, string> = {
  'personality-report': 'Reportes de Personalidad',
  'learning-course': 'Cursos',
  'certificate': 'Certificados',
  'premium-bundle': 'Paquetes',
  'api-access': 'Acceso API',
};

export default function PreciosPage() {
  const products = getAllProducts();

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Precios</h1>
        <p className="text-lg text-gray-600 mb-10">
          Productos digitales para profundizar en tus resultados. Los precios se muestran en USD;
          al pagar, el importe se convierte automáticamente a tu moneda local (USD, EUR, COP y más).
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-2">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h2>
              <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>

              <ul className="text-sm text-gray-700 space-y-1 mb-6">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                <p className="text-xs text-gray-500">USD · impuestos calculados al pagar</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-10">
          Todos los pagos se procesan de forma segura a través de Paddle.com, nuestro vendedor
          autorizado (Merchant of Record). Consulta nuestra{' '}
          <a href="/reembolsos" className="text-blue-600 hover:underline">
            Política de Reembolso
          </a>{' '}
          y nuestros{' '}
          <a href="/terminos" className="text-blue-600 hover:underline">
            Términos de Servicio
          </a>
          .
        </p>
      </div>
    </div>
  );
}
