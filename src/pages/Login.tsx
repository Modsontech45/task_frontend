import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../api/auth';

type Mode = 'login' | 'register' | 'forgot';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
  required = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotDone, setForgotDone] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setForgotDone(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await register(email, name, password);
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotDone(true);
    } catch {
      setError('Impossible de générer le lien. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📅</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">MyDayAI</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ton planning personnel intelligent</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

          {/* ── Forgot password view ── */}
          {mode === 'forgot' ? (
            forgotDone ? (
              <div className="space-y-4 text-center">
                <div className="text-5xl">📬</div>
                <p className="font-semibold text-gray-900 dark:text-white">Email envoyé !</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Un lien de réinitialisation a été envoyé à<br />
                  <strong className="text-gray-700 dark:text-gray-200">{forgotEmail}</strong>.<br />
                  Vérifie ta boîte de réception (et tes spams).
                </p>
                <p className="text-xs text-gray-400">Le lien expire dans 1 heure.</p>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-blue-500 hover:underline font-medium"
                >
                  ← Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={submitForgot} className="space-y-4">
                <div>
                  <button type="button" onClick={() => switchMode('login')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-4 flex items-center gap-1">
                    ← Retour
                  </button>
                  <h2 className="font-bold text-gray-900 dark:text-white mb-1">Mot de passe oublié</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entre ton email pour recevoir un lien de réinitialisation.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</div>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
                  {loading ? 'Génération…' : 'Générer le lien'}
                </button>
              </form>
            )
          ) : (
            <>
              {/* ── Tab toggle (login / register) ── */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                {(['login', 'register'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      mode === m
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {m === 'login' ? 'Connexion' : 'Créer un compte'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Prénom / Nom</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      required
                      autoFocus
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    autoFocus={mode === 'login'}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={setPassword}
                    placeholder={mode === 'register' ? 'Au moins 6 caractères' : '••••••••'}
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe</label>
                    <PasswordInput
                      id="confirm"
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="Répète ton mot de passe"
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </button>
              </form>

              {mode === 'register' && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  Ton planning complet (cours, gym, bilingual…) sera configuré automatiquement.
                </p>
              )}
            </>
          )}
        </div>

        {mode !== 'forgot' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button type="button" onClick={() => switchMode('register')} className="text-blue-500 hover:underline font-medium">Créer un compte</button>
              </>
            ) : (
              <>Déjà inscrit ?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-500 hover:underline font-medium">Se connecter</button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
