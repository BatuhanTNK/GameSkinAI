/**
 * @fileoverview Yeni Şifre Belirleme Sayfası.
 * Kullanıcı e-posta sıfırlama bağlantısına tıkladığında açılır.
 * Yeni şifre girilip Supabase veritabanında güncellenir.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from 'components/fields/InputField';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';
import { ROUTES } from 'lib/constants';
import { HiSparkles, HiCheckCircle, HiXCircle } from 'react-icons/hi2';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedNotice, setSuggestedNotice] = useState(false);
  const { updatePassword } = useAuth();

  // Şifre güvenlik kriterleri
  const pwRequirements = [
    {
      key: 'length',
      labelKey: 'auth.pwReqLength',
      isValid: password.length >= 8,
    },
    {
      key: 'upper',
      labelKey: 'auth.pwReqUpper',
      isValid: /[A-Z]/.test(password),
    },
    {
      key: 'lower',
      labelKey: 'auth.pwReqLower',
      isValid: /[a-z]/.test(password),
    },
    {
      key: 'number',
      labelKey: 'auth.pwReqNumber',
      isValid: /[0-9]/.test(password),
    },
    {
      key: 'special',
      labelKey: 'auth.pwReqSpecial',
      // eslint-disable-next-line no-useless-escape
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const metCount = pwRequirements.filter((r) => r.isValid).length;
  const isAllPwMet = metCount === pwRequirements.length;

  const getStrengthInfo = () => {
    if (!password) return { label: '', color: 'bg-gray-200 dark:bg-navy-700', percent: 0 };
    if (metCount <= 2) return { label: t('auth.pwStrengthWeak'), color: 'bg-red-500', textColor: 'text-red-500', percent: 25 };
    if (metCount <= 3) return { label: t('auth.pwStrengthMedium'), color: 'bg-amber-500', textColor: 'text-amber-500', percent: 50 };
    if (metCount <= 4) return { label: t('auth.pwStrengthStrong'), color: 'bg-blue-500', textColor: 'text-blue-500', percent: 75 };
    return { label: t('auth.pwStrengthVeryStrong'), color: 'bg-emerald-500', textColor: 'text-emerald-500', percent: 100 };
  };

  const strengthInfo = getStrengthInfo();

  /**
   * Otomatik Güçlü Şifre Oluşturucu
   */
  const handleGeneratePassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+-=';
    
    let chars = [
      uppers[Math.floor(Math.random() * uppers.length)],
      lowers[Math.floor(Math.random() * lowers.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    
    const all = uppers + lowers + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }
    
    const generated = chars.sort(() => Math.random() - 0.5).join('');
    setPassword(generated);
    setConfirmPassword(generated);
    setSuggestedNotice(true);
    setTimeout(() => setSuggestedNotice(false), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (!isAllPwMet) {
      setError(t('auth.passwordRequirementsNotMet'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateErr } = await updatePassword(password);
      if (updateErr) {
        setError(updateErr.message || 'Şifre güncellenemedi.');
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError('Şifre güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
        <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <svg
              className="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h4 className="mb-2.5 text-3xl font-bold text-navy-700 dark:text-white">
            {t('auth.resetSuccessTitle')}
          </h4>
          <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
            {t('auth.resetSuccessSubtitle')}
          </p>

          <Link
            to={ROUTES.SIGN_IN}
            className="linear flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <form
        onSubmit={handleSubmit}
        className="mt-[8vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[440px]"
      >
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          {t('auth.resetPasswordTitle')}
        </h4>
        <p className="mb-8 ml-1 text-base text-gray-600 dark:text-gray-400">
          {t('auth.resetPasswordSubtitle')}
        </p>

        {error && (
          <div className="mb-4 flex items-center rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Yeni Şifre */}
        <InputField
          variant="auth"
          extra="mb-2"
          label={t('auth.newPasswordLabel')}
          placeholder={t('auth.newPasswordPlaceholder')}
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        {/* Güçlü Şifre Öner / Üret Butonu & Bildirimi */}
        <div className="mb-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleGeneratePassword}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              <HiSparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              {t('auth.suggestPassword')}
            </button>
            {password && (
              <span className={`text-xs font-bold ${strengthInfo.textColor}`}>
                {t('auth.pwStrengthTitle')} {strengthInfo.label}
              </span>
            )}
          </div>

          {suggestedNotice && (
            <div className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400 flex items-center gap-1.5">
              <HiCheckCircle className="h-4 w-4 shrink-0" />
              {t('auth.suggestedPasswordCopied')}
            </div>
          )}

          {password && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-700">
              <div
                className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                style={{ width: `${strengthInfo.percent}%` }}
              />
            </div>
          )}
        </div>

        {/* Kriter Listesi */}
        <div className="mb-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3.5 dark:border-white/10 dark:bg-navy-800/40">
          <p className="mb-2 text-xs font-bold text-navy-700 dark:text-gray-300">
            {t('auth.pwReqTitle')}
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {pwRequirements.map((req) => (
              <div
                key={req.key}
                className="flex items-center gap-1.5 text-xs transition-colors"
              >
                {req.isValid ? (
                  <HiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <HiXCircle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                )}
                <span
                  className={
                    req.isValid
                      ? 'font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                >
                  {t(req.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Yeni Şifre Tekrar */}
        <InputField
          variant="auth"
          extra="mb-4"
          label={t('auth.confirmNewPasswordLabel')}
          placeholder={t('auth.confirmNewPasswordPlaceholder')}
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="linear mt-2 flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {isLoading ? t('auth.updatingPassword') : t('auth.updatePasswordBtn')}
        </button>
      </form>
    </div>
  );
}
