import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Política de Privacidad | QuizLab',
  description: 'Política de privacidad y protección de datos de QuizLab',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introducción</h2>
            <p>
              En QuizLab, nos comprometemos a proteger tu privacidad. Esta política de privacidad explica cómo
              recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Información que Recopilamos</h2>
            <p>Recopilamos información de varias maneras:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Información voluntaria:</strong> Nombre, correo electrónico y datos de perfil que proporcionas</li>
              <li><strong>Datos de uso:</strong> Información sobre cómo interactúas con nuestros tests y quizzes</li>
              <li><strong>Cookies:</strong> Para mejorar tu experiencia y analítica</li>
              <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, ubicación aproximada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Cómo Usamos Tu Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Personalizar tu experiencia</li>
              <li>Enviar comunicaciones relevantes</li>
              <li>Analizar tendencias y estadísticas de uso</li>
              <li>Detectar y prevenir actividades fraudulentas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Compartición de Información</h2>
            <p>
              No vendemos, comercializamos ni transferimos tu información personalmente identificable a terceros
              sin tu consentimiento, excepto cuando sea requerido por ley o para proporcionar servicios que has solicitado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger tu información personal.
              Sin embargo, ningún método de transmisión por Internet es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies</h2>
            <p>
              Utilizamos cookies para mejorar tu experiencia. Puedes configurar tu navegador para rechazar todas las cookies,
              aunque esto puede afectar el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Derechos del Usuario</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cambios a Esta Política</h2>
            <p>
              Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento.
              Los cambios serán efectivos inmediatamente después de su publicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, por favor contacta con nosotros en
              <a href="mailto:privacidad@quizlab.com" className="text-blue-600 hover:underline"> privacidad@quizlab.com</a>
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
