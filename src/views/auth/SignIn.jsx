/**
 * @fileoverview Giriş sayfası.
 * Horizon UI Tailwind şablonunun auth stilini koruyarak
 * Supabase authentication entegrasyonu sağlar.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from 'components/fields/InputField';
import { useAuth } from 'contexts/AuthContext';
import { ROUTES, MESSAGES } from 'lib/constants';

/**
 * Giriş sayfası bileşeni.
 * Email ve şifre ile Supabase authentication yapar.
 */
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithDiscord } = useAuth();
  const navigate = useNavigate();

  /**
   * Form gönderim işleyicisi.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        // Supabase hata mesajlarını Türkçeye çevir
        const errorMessages = {
          'Invalid login credentials': 'E-posta veya şifre hatalı.',
          'Email not confirmed': 'E-posta adresiniz henüz doğrulanmamış.',
          'Too many requests': 'Çok fazla deneme. Lütfen biraz bekleyin.',
        };
        setError(
          errorMessages[signInError.message] ||
            signInError.message ||
            MESSAGES.SIGN_IN_ERROR
        );
        return;
      }
      navigate(ROUTES.CONVERTER);
    } catch (err) {
      setError(MESSAGES.SIGN_IN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <form
        onSubmit={handleSubmit}
        className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]"
      >
        {/* Başlık */}
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Giriş Yap
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          GameSkinAI'ya hoş geldiniz! Devam etmek için giriş yapın.
        </p>

        {/* Sosyal Giriş Butonları */}
        <div className="mb-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={async () => {
              setError('');
              const { error: oauthErr } = await signInWithGoogle();
              if (oauthErr) setError(oauthErr.message || 'Google girişi başarısız.');
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile Giriş Yap
          </button>

          <button
            type="button"
            onClick={async () => {
              setError('');
              const { error: oauthErr } = await signInWithDiscord();
              if (oauthErr) setError(oauthErr.message || 'Discord girişi başarısız.');
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Discord ile Giriş Yap
          </button>
        </div>

        {/* Ayraç */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-navy-700" />
          <span className="text-xs font-medium text-gray-400">veya e-posta ile</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-navy-700" />
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-4 flex items-center rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <svg
              className="mr-3 h-5 w-5 flex-shrink-0 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Email */}
        <InputField
          variant="auth"
          extra="mb-3"
          label="E-posta*"
          placeholder="ornek@email.com"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        {/* Password */}
        <InputField
          variant="auth"
          extra="mb-3"
          label="Şifre*"
          placeholder="Min. 8 karakter"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        {/* Giriş Butonu */}
        <button
          type="submit"
          disabled={isLoading}
          className="linear mt-4 flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </button>

        {/* Kayıt Linki */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Hesabınız yok mu?
          </span>
          <Link
            to={ROUTES.SIGN_UP}
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Kayıt olun
          </Link>
        </div>
      </form>
    </div>
  );
}
