import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '../lib/supabaseClient';

/**
 * /reset-password            ← you whitelisted this in Supabase
 * Supabase attaches #access_token … to the URL, immediately signs the user in,
 * and emits the PASSWORD_RECOVERY auth-state event.  We listen for that,
 * then ask the user to choose a new password.
 */
export default function ResetPasswordPage() {
  const nav          = useNavigate();
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [params]     = useSearchParams();          // keeps TS happy – parsing is done by Supabase
  const [stage, setStage] = useState<
    'verify' | 'set' | 'done' | 'error'
  >('verify');

  /* ───────────────── state for the form ───────────────── */
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [mismatch,        setMismatch]        = useState(false);
  const [err,             setErr]             = useState<string | null>(null);

  /* Supabase fires PASSWORD_RECOVERY as soon as the hash token is processed */
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(evt => {
        if (evt === 'PASSWORD_RECOVERY') setStage('set');
      });

    return () => subscription.unsubscribe();
  }, []);

  /* ───────────────── submit new password ───────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setStage('error');
    } else {
      setStage('done');
      setTimeout(() => nav('/login'), 1800);
    }
  };

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <main className="min-h-screen flex items-center justify-center
                     bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800
                      shadow rounded-xl p-8">

        {stage === 'verify' && (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Verifying reset link…
          </p>
        )}

        {stage === 'set' && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Choose&nbsp;a&nbsp;new&nbsp;password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ─── Password ─── */}
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="New password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setMismatch(false);
                  }}
                  className="w-full px-4 py-2 border rounded-lg pr-12
                             bg-gray-50 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-3 flex items-center text-sm
                             text-gray-500 hover:text-gray-700 dark:text-gray-300"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* ─── Confirm ─── */}
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setMismatch(false);
                  }}
                  className="w-full px-4 py-2 border rounded-lg pr-12
                             bg-gray-50 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {mismatch && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Passwords don’t match
                </p>
              )}

              <button
                type="submit"
                disabled={
                  !password || password !== confirmPassword || password.length < 6
                }
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-blue-700 transition"
              >
                Update&nbsp;Password
              </button>
            </form>
          </>
        )}

        {stage === 'done' && (
          <p className="text-center text-green-600 dark:text-green-400">
            Password updated! Redirecting&nbsp;to&nbsp;log-in…
          </p>
        )}

        {stage === 'error' && (
          <p className="text-center text-red-600 dark:text-red-400">
            {err}
          </p>
        )}
      </div>
    </main>
  );
}
