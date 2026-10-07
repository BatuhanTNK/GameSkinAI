/* eslint-disable */
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";
import { useIsAdmin } from "hooks/useIsAdmin";
import { MdLogout } from "react-icons/md";

export function SidebarLinks(props) {
  let location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, lang } = useTranslation();
  const { isAdmin } = useIsAdmin();

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  /**
   * Oturum kapatma işleyicisi.
   */
  const handleSignOut = async () => {
    await signOut();
    navigate(`/${lang}/auth/sign-in`);
  };

  const createLinks = (routes) => {
    return routes
      .filter((route) => !route.hidden) // Hidden route'ları filtrele
      .filter((route) => !route.adminOnly || isAdmin) // Admin route'ları sadece adminlere göster
      .filter((route) => route.layout === "/admin" || route.layout === "")
      .map((route, index) => {
        const translatedName = t(`nav.${route.path}`) !== `nav.${route.path}` 
          ? t(`nav.${route.path}`) 
          : route.name;

        const targetPath = route.layout === "" ? `/${lang}` : `/${lang}${route.layout}/${route.path}`;
        const isLandingLink = route.layout === "";
        const isActive = isLandingLink 
          ? (location.pathname === `/${lang}` || location.pathname === "/") 
          : activeRoute(route.path);

        return (
          <li key={index} className="relative mb-1">
            <Link
              to={targetPath}
              className={`flex items-center px-8 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "font-bold text-navy-700 dark:text-white bg-brand-50/50 dark:bg-navy-700/50"
                  : "font-medium text-gray-600 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-navy-700/30"
              }`}
            >
              <span className={`text-xl ${isActive ? "text-brand-500 dark:text-brand-400" : "text-gray-400"}`}>
                {route.icon ? route.icon : <DashIcon />}
              </span>
              <span className="ml-4 text-sm leading-none">
                {translatedName}
              </span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-lg bg-brand-500 dark:bg-brand-400" />
              )}
            </Link>
          </li>
        );
      });
  };

  return (
    <>
      {createLinks(routes)}
      {/* Çıkış Yap butonu */}
      <li className="relative mt-2 pt-2 border-t border-gray-100 dark:border-navy-700">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center px-8 py-2.5 font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors text-left"
        >
          <MdLogout className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
          <span className="ml-4 text-sm leading-none">{t('nav.logout')}</span>
        </button>
      </li>
    </>
  );
}

export default SidebarLinks;
