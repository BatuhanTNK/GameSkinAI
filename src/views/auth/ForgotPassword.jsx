/**
 * @fileoverview Şifre sıfırlama talebi sayfası.
 * Kullanıcı e-posta adresini girerek şifre sıfırlama bağlantısı talep eder.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from 'components/fields/InputField';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';
import { ROUTES } from 'lib/constants';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetErr } = await resetPassword(cleanEmail);
      if (resetErr) {
        setError(resetErr.message || 'Şifre sıfırlama e-postası gönderilemedi.');
        return;
      }
      setSuccessMessage(t('auth.resetSuccess'));
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
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
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          {t('auth.forgotPassword')}
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600 dark:text-gray-400">
          {t('auth.forgotPasswordSubtitle')}
        </p>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-4 flex items-center rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Başarı Mesajı */}
        {successMessage && (
          <div className="mb-4 flex items-center rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
            <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Email */}
        <InputField
          variant="auth"
          extra="mb-4"
          label="E-posta*"
          placeholder="ornek@email.com"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={isLoading}
          className="linear mt-2 flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {isLoading ? 'Gönderiliyor...' : t('auth.sendResetLink')}
        </button>

        {/* Giriş Linki */}
        <div className="mt-6 text-center">
          <Link
            to={ROUTES.SIGN_IN}
            className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            ← {t('auth.backToSignIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}
