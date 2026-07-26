/**
 * @fileoverview Kayıt sayfası.
 * Horizon UI Tailwind şablonunun auth stilini koruyarak
 * Supabase authentication kayıt entegrasyonu sağlar.
 * TR / EN çoklu dil desteği, kullanıcı adı girişi ve gelişmiş şifre kriteri/önerisi içerir.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from 'components/fields/InputField';
import { useAuth } from 'contexts/AuthContext';
import { useTranslation } from 'contexts/TranslationContext';
import { ROUTES, MESSAGES } from 'lib/constants';
import { HiSparkles, HiCheckCircle, HiXCircle } from 'react-icons/hi2';

/**
 * Kayıt sayfası bileşeni.
 * Kullanıcı adı, email ve güçlü şifre ile Supabase kayıt yapar.
 */
export default function SignUp() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedNotice, setSuggestedNotice] = useState(false);
  const { signUp } = useAuth();

  // Şifre güvenlik kriterleri kontrolü
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

  // Şifre gücü metni ve renk belirleme
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
    
    // Her gruptan en az 1 karakter garantile
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

  /**
   * Form doğrulama.
   * @returns {string|null} Hata mesajı veya null
   */
  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      return t('auth.fillAllFields');
    }
    if (username.trim().length < 3) {
      return t('auth.usernameMinLength');
    }
    if (!isAllPwMet) {
      return t('auth.passwordRequirementsNotMet');
    }
    if (password !== confirmPassword) {
      return t('auth.passwordsDoNotMatch');
    }
    return null;
  };

  /**
   * Form gönderim işleyicisi.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(
        cleanEmail,
        password,
        cleanUsername
      );
      if (signUpError) {
        const errorMessages = {
          'User already registered': t('auth.userAlreadyRegistered'),
          'Password should be at least 6 characters': t('auth.pwReqLength'),
          'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı.',
        };
        setError(
          errorMessages[signUpError.message] || MESSAGES.SIGN_UP_ERROR
        );
        if (process.env.NODE_ENV === 'development') {
          console.error('SignUp detaylı hata:', signUpError);
        }
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(MESSAGES.SIGN_UP_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Başarılı kayıt ekranı
  if (success) {
    return (
      <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
        <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
          {/* Başarı İkonu */}
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
            {t('auth.signUpSuccessTitle')}
          </h4>
          <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
            {t('auth.signUpSuccessSubtitle')}
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
        className="mt-[5vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[440px]"
      >
        {/* Başlık */}
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          {t('auth.signUpTitle')}
        </h4>
        <p className="mb-8 ml-1 text-base text-gray-600 dark:text-gray-400">
          {t('auth.signUpSubtitle')}
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

        {/* Kullanıcı Adı */}
        <InputField
          variant="auth"
          extra="mb-3"
          label={t('auth.usernameLabel')}
          placeholder={t('auth.usernamePlaceholder')}
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />

        {/* Email */}
        <InputField
          variant="auth"
          extra="mb-3"
          label={t('auth.emailLabel')}
          placeholder={t('auth.emailPlaceholder')}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        {/* Password */}
        <InputField
          variant="auth"
          extra="mb-2"
          label={t('auth.passwordLabel')}
          placeholder={t('auth.passwordPlaceholder')}
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

          {/* Güç Barı */}
          {password && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-700">
              <div
                className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                style={{ width: `${strengthInfo.percent}%` }}
              />
            </div>
          )}
        </div>

        {/* Güçlü Şifre Kriter Listesi (Checklist) */}
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

        {/* Confirm Password */}
        <InputField
          variant="auth"
          extra="mb-3"
          label={t('auth.confirmPasswordLabel')}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        {/* Kayıt Butonu */}
        <button
          type="submit"
          disabled={isLoading}
          className="linear mt-2 flex w-full items-center justify-center rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
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
              {t('auth.signingUp')}
            </>
          ) : (
            t('auth.signUpBtn')
          )}
        </button>

        {/* Giriş Linki */}
        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-400">
            {t('auth.alreadyHaveAccount')}
          </span>
          <Link
            to={ROUTES.SIGN_IN}
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            {t('auth.signInLink')}
          </Link>
        </div>
      </form>
    </div>
  );
}
