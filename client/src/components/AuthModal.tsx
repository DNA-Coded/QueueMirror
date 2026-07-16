import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, googleLoginMock } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (forgotPasswordMode) {
        // Mock send forgot password
        await new Promise(r => setTimeout(r, 1000));
        setResetSent(true);
      } else if (isLogin) {
        await login(email, password);
        onClose();
      } else {
        await register(name, email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLoginMock(
        isLogin ? 'Google User' : name || 'Google Explorer',
        email || 'google.user@gmail.com'
      );
      onClose();
    } catch (err: any) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden glass-panel relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-md right-md text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-lg">
          <div className="text-center mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {forgotPasswordMode
                ? 'Reset Password'
                : isLogin
                ? 'Sign in to QueueMirror'
                : 'Create your account'}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
              {forgotPasswordMode
                ? 'We will send you instructions to reset your password.'
                : 'Access live status, predictions, and save locations.'}
            </p>
          </div>

          {error && (
            <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded font-body-sm text-body-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {forgotPasswordMode && resetSent ? (
            <div className="text-center py-lg">
              <span className="material-symbols-outlined text-primary text-[48px] mb-sm">mark_email_read</span>
              <p className="font-body-md text-body-md text-on-surface">Reset link sent successfully!</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Check your inbox for further instructions.</p>
              <button
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetSent(false);
                }}
                className="mt-lg text-primary hover:underline font-label-md text-label-md cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {!isLogin && !forgotPasswordMode && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs font-semibold">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {!forgotPasswordMode && (
                <div>
                  <div className="flex justify-between items-center mb-xs">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:bg-primary-container hover:shadow-md transition-all flex items-center justify-center gap-xs font-bold active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing...' : forgotPasswordMode ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>

              {!forgotPasswordMode && (
                <>
                  <div className="flex items-center gap-sm my-xs">
                    <div className="flex-grow h-px bg-outline-variant"></div>
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">or</span>
                    <div className="flex-grow h-px bg-outline-variant"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors py-sm rounded-lg flex items-center justify-center gap-sm font-label-md text-label-md text-on-surface font-semibold cursor-pointer active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </form>
          )}

          <div className="mt-lg pt-md border-t border-outline-variant text-center">
            {forgotPasswordMode ? (
              <button
                onClick={() => setForgotPasswordMode(false)}
                className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
