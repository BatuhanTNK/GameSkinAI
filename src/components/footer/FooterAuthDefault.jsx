import React from "react";
import { useTranslation } from "contexts/TranslationContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="z-[5] mx-auto flex w-full max-w-screen-sm flex-col items-center justify-between px-[20px] pb-4 lg:mb-6 lg:max-w-[100%] lg:flex-row xl:mb-2 xl:w-[1310px] xl:pb-6">
      <p className="mb-4 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 md:text-base lg:mb-0">
        © {new Date().getFullYear()} GameSkinAI. {t('footer.rights')}
      </p>
    </footer>
  );
}

