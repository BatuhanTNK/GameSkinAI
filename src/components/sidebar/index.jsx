/* eslint-disable */

import React from "react";
import { Link } from "react-router-dom";
import { HiX } from "react-icons/hi";
import Links from "./components/Links";

import SidebarCard from "components/sidebar/componentsrtl/SidebarCard";
import routes from "routes.js";
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
        className={`w-[300px] duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-gray-200/50 transition-all dark:!bg-navy-800 dark:text-white dark:shadow-none md:!z-50 lg:!z-50 xl:!z-0 ${
          open ? "translate-x-0" : "-translate-x-96"
        }`}
      >
        <span
          className="absolute top-4 right-4 block cursor-pointer xl:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-700"
          onClick={onClose}
        >
          <HiX className="h-5 w-5" />
        </span>

        <Link
          to={`/${lang}`}
          className="mx-[56px] mt-[50px] flex items-center cursor-pointer group"
          title={t('nav.goToHome')}
        >
          <div className="mt-1 ml-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white group-hover:opacity-80 transition-opacity">
            Game<span className="font-medium text-brand-500">SkinAI</span>
          </div>
        </Link>
        
        <div className="mt-[58px] mb-7 h-px bg-gray-200 dark:bg-white/10" />
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
