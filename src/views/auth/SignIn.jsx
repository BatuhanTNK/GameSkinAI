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
  const { signIn } = useAuth();
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
