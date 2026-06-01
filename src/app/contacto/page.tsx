import { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto | QuizLab',
  description: 'Formulario de contacto y información de QuizLab',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contacta con Nosotros</h1>
          <p className="text-xl text-gray-600">¿Tienes preguntas? Nos encantaría escucharte.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Mail className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
            <a href="mailto:contacto@quizlab.com" className="text-blue-600 hover:underline">
              contacto@quizlab.com
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Phone className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-gray-600">Disponible de lunes a viernes, 9:00 - 17:00</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <MapPin className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600">En línea - Disponible 24/7</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                Asunto
              </label>
              <input
                type="text"
                id="asunto"
                name="asunto"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="¿Cuál es el asunto?"
              />
            </div>

            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Cuéntanos cómo podemos ayudarte..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition duration-300"
            >
              Enviar Mensaje
            </button>
          </form>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> Respondemos a todos los mensajes dentro de 24-48 horas hábiles.
              Para asuntos urgentes, por favor envíanos un email directamente a
              <a href="mailto:urgente@quizlab.com" className="text-blue-600 hover:underline"> urgente@quizlab.com</a>
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Cuánto tiempo tarda en responder?</h3>
              <p className="text-gray-600">
                Generalmente respondemos en 24-48 horas hábiles. Durante fin de semana puede tomar más tiempo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Ofrecen soporte para empresas?</h3>
              <p className="text-gray-600">
                Sí, tenemos planes especiales para empresas. Contacta a nuestro equipo de ventas para más detalles.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Cómo reporto un error?</h3>
              <p className="text-gray-600">
                Puedes reportar errores directamente en el formulario de arriba, indicando en "Asunto" que es un reporte de error.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
