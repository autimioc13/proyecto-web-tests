import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Términos de Servicio | QuizLab',
  description: 'Términos y condiciones de uso de QuizLab',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar QuizLab, aceptas estar vinculado por estos términos y condiciones.
              Si no estás de acuerdo con alguna parte de estos términos, no puedes utilizar nuestro servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Licencia de Uso</h2>
            <p>
              Se te otorga una licencia limitada, no exclusiva, revocable para acceder y utilizar QuizLab
              únicamente para fines personales y no comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Restricciones de Uso</h2>
            <p>No debes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modificar, copiar o distribuir el contenido sin autorización</li>
              <li>Intentar acceder a sistemas o redes sin autorización</li>
              <li>Enviar spam, malware o contenido ofensivo</li>
              <li>Violar leyes locales, estatales, nacionales o internacionales</li>
              <li>Interferir con el funcionamiento normal del sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contenido del Usuario</h2>
            <p>
              Si publicas contenido en QuizLab, declaras que tienes derecho a hacerlo y que no viola derechos de terceros.
              Nos reservamos el derecho de eliminar cualquier contenido que viole estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Limitación de Responsabilidad</h2>
            <p>
              QuizLab se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables por daños
              indirectos, incidentales, especiales o consecuentes derivados de tu uso del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Renuncia de Garantías</h2>
            <p>
              Renunciamos a todas las garantías, expresas o implícitas, incluyendo pero no limitado a
              garantías de comerciabilidad, adecuación para un propósito particular y no infracción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Indemnización</h2>
            <p>
              Aceptas indemnizar y mantener indemne a QuizLab de cualquier reclamación, daño, gasto o costo
              (incluyendo honorarios legales) que surja de tu violación de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cambios a los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Tu uso continuo del sitio constituye aceptación de los términos revisados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Suspensión de Cuenta</h2>
            <p>
              Podemos suspender o terminar tu acceso a QuizLab en cualquier momento si violas estos términos
              o por cualquier otra razón sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de tu jurisdicción local.
              Cualquier disputa será resuelta en los tribunales competentes de esa jurisdicción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, por favor contacta con nosotros en
              <a href="mailto:legal@quizlab.com" className="text-blue-600 hover:underline"> legal@quizlab.com</a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
