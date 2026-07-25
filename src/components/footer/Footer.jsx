/**
 * @fileoverview Admin layout footer bileşeni.
 */

import { useTranslation } from 'contexts/TranslationContext';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 lg:px-8 xl:flex-row">
      <h5 className="mb-4 text-center text-sm font-medium text-gray-600 sm:!mb-0 md:text-lg">
        <p className="mb-4 text-center text-sm text-gray-600 sm:!mb-0 md:text-base">
          ©{1900 + new Date().getYear()} GameSkinAI. {t('footer.rights')}
        </p>
      </h5>
    </div>
  );
};


export default Footer;
