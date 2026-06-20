import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Política de Reembolso | QuizLab',
  description: 'Política de reembolso para los productos digitales de QuizLab.',
};

export default function ReembolsosPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Reembolso</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Vendedor autorizado</h2>
            <p>
              Los pagos de los productos digitales de QuizLab son procesados por Paddle.com Market Limited,
              que actúa como nuestro vendedor autorizado (Merchant of Record). Las solicitudes de reembolso
              se gestionan conforme a esta política y a los términos de Paddle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Garantía de 14 días</h2>
            <p>
              Ofrecemos una garantía de reembolso de <strong>14 días</strong> a partir de la fecha de compra
              para nuestros productos digitales. Si no estás satisfecho con tu compra, puedes solicitar un
              reembolso dentro de este periodo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Condiciones</h2>
            <p>Para que un reembolso sea elegible:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La solicitud debe realizarse dentro de los 14 días posteriores a la compra.</li>
              <li>
                En el caso de cursos y materiales de aprendizaje, el reembolso puede denegarse si se ha
                consumido una parte sustancial del contenido.
              </li>
              <li>
                Los productos de acceso por suscripción (por ejemplo, acceso a la API) pueden cancelarse en
                cualquier momento; no se reembolsan los periodos ya transcurridos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cómo solicitar un reembolso</h2>
            <p>
              Envía tu solicitud a{' '}
              <a href="mailto:soporte@quizlab.com" className="text-blue-600 hover:underline">
                soporte@quizlab.com
              </a>{' '}
              indicando el correo de compra y el número de orden. También puedes responder al recibo enviado
              por Paddle. Procesaremos las solicitudes elegibles en un plazo de 5 a 10 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Reembolsos a tu método de pago</h2>
            <p>
              Los reembolsos aprobados se devuelven al método de pago original. El tiempo de acreditación
              depende de tu banco o emisor de la tarjeta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Contacto</h2>
            <p>
              Para cualquier duda sobre reembolsos, escríbenos a{' '}
              <a href="mailto:soporte@quizlab.com" className="text-blue-600 hover:underline">
                soporte@quizlab.com
              </a>
              .
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
