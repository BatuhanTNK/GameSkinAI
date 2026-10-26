/**
 * @fileoverview Sidebar alt kartı.
 * GameSkinAI hakkında kısa bilgi ve dönüştürücüye yönlendirme.
 */

import { MdAutoAwesome } from "react-icons/md";
import { Link } from "react-router-dom";
import { useTranslation } from "contexts/TranslationContext";

const SidebarCard = () => {
  const { t, lang } = useTranslation();

  return (
    <div className="mx-4 mt-8 flex w-full flex-col rounded-xl border border-brand-100 bg-brand-50 p-5 dark:border-navy-700 dark:bg-navy-900">
      <div className="flex h-fit flex-col items-start">
        <MdAutoAwesome className="mb-3 h-6 w-6 text-brand-500 dark:text-brand-400" />
        <p className="text-sm font-bold text-navy-700 dark:text-white">{t('studio.stylePreview')}</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {t('sidebar.cardDesc')}
        </p>

        <Link
          to={`/${lang}/admin/converter`}
          className="mt-4 block text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
        >
          {t('sidebar.cardBtn')}
        </Link>
      </div>
    </div>
  );
};



export default SidebarCard;
