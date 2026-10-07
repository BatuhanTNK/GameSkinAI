/**
 * @fileoverview Admin layout footer bileşeni.
 */

import { useTranslation } from 'contexts/TranslationContext';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="flex w-full flex-col items-center justify-between px-1 pb-6 pt-3 lg:px-8 xl:flex-row border-t border-gray-200/40 dark:border-navy-700/40">
      <p className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} GameSkinAI. {t('footer.rights')}
      </p>
    </footer>
  );
};


export default Footer;
