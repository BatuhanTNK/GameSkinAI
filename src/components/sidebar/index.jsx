/* eslint-disable */

import React from "react";
import { Link } from "react-router-dom";
import { HiX } from "react-icons/hi";
import Links from "./components/Links";

import SidebarCard from "components/sidebar/componentsrtl/SidebarCard";
import routes from "routes.js";
import Brand from "components/common/Brand";
import { useTranslation } from "contexts/TranslationContext";

const Sidebar = ({ open, onClose }) => {
  const { t, lang } = useTranslation();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-xs xl:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      <div
        className={`studio-sidebar w-[270px] duration-200 fixed !z-50 flex h-dvh flex-col overflow-y-auto bg-white pb-6 transition-transform dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
          open ? "translate-x-0" : "-translate-x-96"
        }`}
      >
        <button
          type="button"
          aria-label={t('studio.toggleMenu')}
          className="absolute top-4 right-4 block cursor-pointer xl:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-700"
          onClick={onClose}
        >
          <HiX className="h-5 w-5" />
        </button>

        <Link
          to={`/${lang}`}
          className="mx-6 mt-8 flex items-center cursor-pointer group"
          title={t('nav.goToHome')}
        >
          <Brand />
        </Link>
        
        <div className="mt-8 mb-5 h-px bg-gray-200 dark:bg-white/10" />
        {/* Nav item */}

        <ul className="mb-auto pt-1">
          <Links routes={routes} />
        </ul>

        {/* Free Horizon Card */}
        <div className="flex justify-center">
          <SidebarCard />
        </div>

        {/* Nav item end */}
      </div>
    </>
  );
};

export default Sidebar;
