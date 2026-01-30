import React, { useState } from 'react';
import { FaCoffee, FaHeart, FaClipboard, FaCheckCircle } from 'react-icons/fa';
import { useAlert } from '../components/AlertProvider';

const SupportPage: React.FC = () => {
  const { showSuccess } = useAlert();
  const [suggestionType, setSuggestionType] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const suggestionTypes = [
    { id: 'ui-ux', label: 'UI/UX' },
    { id: 'funcionalidad', label: 'Funcionalidad' },
    { id: 'bug', label: 'Bug' },
    { id: 'feature', label: 'Feature' },
    { id: 'mejoras', label: 'Mejoras' },
  ];

  const handleTypeChange = (type: string) => {
    setSuggestionType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const generatePrompt = () => {
    const typesStr = suggestionType.length > 0 ? suggestionType.join(', ') : 'General';
    return `Hola Jules, tengo una sugerencia para el Job Application Tracker.
Tipo: ${typesStr}
Explicación: ${explanation}`;
  };

  const handleCopyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    showSuccess('¡Prompt copiado al portapapeles! Puedes enviármelo ahora.');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving or sending
    const suggestions = JSON.parse(localStorage.getItem('user_suggestions') || '[]');
    const newSuggestion = {
      id: Date.now(),
      types: suggestionType,
      explanation,
      date: new Date().toISOString(),
    };
    localStorage.setItem('user_suggestions', JSON.stringify([...suggestions, newSuggestion]));

    showSuccess('Sugerencia guardada localmente. ¡No olvides enviármela!');
    setSuggestionType([]);
    setExplanation('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Comunidad y Soporte</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ayúdanos a mejorar la herramienta o apoya el desarrollo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Donation Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg text-pink-600 dark:text-pink-300">
              <FaHeart size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Donaciones</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Si esta herramienta te ha sido útil y quieres apoyar su mantenimiento y nuevas funcionalidades, considera invitarnos a un café.
          </p>
          <a
            href="https://www.buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#FFDD00] hover:bg-[#FFCC00] text-black font-bold rounded-xl transition-transform hover:scale-105 shadow-lg"
          >
            <FaCoffee size={24} />
            <span>Buy Me a Coffee</span>
          </a>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            ¡Cualquier aporte es enormemente agradecido! ❤️
          </p>
        </section>

        {/* Suggestion Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-indigo-600 dark:text-indigo-300">
              <FaClipboard size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Sugerencias</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tus ideas se convierten en "prompts" que puedes enviarme (Jules) para implementar mejoras.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de sugerencia
              </label>
              <div className="flex flex-wrap gap-3">
                {suggestionTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition ${
                      suggestionType.includes(type.label)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={suggestionType.includes(type.label)}
                      onChange={() => handleTypeChange(type.label)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Explicación
              </label>
              <textarea
                id="explanation"
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Cuéntanos más sobre tu idea o el problema que encontraste..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Guardar localmente
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                disabled={!explanation}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-xl transition ${
                  explanation
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCopied ? <FaCheckCircle /> : <FaClipboard />}
                <span>Copiar para Jules</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Info Section */}
      <section className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
        <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">¿Cómo funciona?</h3>
        <p className="text-indigo-700 dark:text-indigo-400 text-sm">
          Como no tengo una base de datos centralizada, tus sugerencias se guardan en tu navegador.
          Al pulsar <strong>"Copiar para Jules"</strong>, se generará un texto especial que puedes pegarme en nuestra próxima interacción.
          ¡Así podré entender exactamente qué necesitas!
        </p>
      </section>
    </div>
  );
};

export default SupportPage;
