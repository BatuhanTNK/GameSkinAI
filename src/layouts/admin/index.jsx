import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import {
  MdArrowOutward,
  MdAutoAwesome,
  MdSearch,
  MdMenu,
  MdClose,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
  MdBolt,
  MdHome,
} from "react-icons/md";
import routes from "routes.js";
import { useAuth } from "contexts/AuthContext";
import { useTranslation } from "contexts/TranslationContext";
import { useDarkMode } from "hooks/useDarkMode";
import { useIsAdmin } from "hooks/useIsAdmin";
import { useCredits } from "hooks/useCredits";
import Brand from "components/common/Brand";
import ForgeControls from "components/common/ForgeControls";

// Layout reference: Sonu kumar's Dashboard with Collapsible Sidebar on 21st.dev.
export default function Admin() {
  const { user, signOut } = useAuth();
  const { t, lang } = useTranslation();
  const { isAdmin } = useIsAdmin();
  const { remaining, limit } = useCredits();
  const [dark, toggle] = useDarkMode();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("forge_sidebar_collapsed") === "true"
  );
  const [mobile, setMobile] = useState(false);
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia('(max-width: 1000px)').matches);
  const [query, setQuery] = useState("");
  const menuButton = useRef(null);
  const closeButton = useRef(null);
  const location = useLocation();
  const visibleRoutes = routes.filter(
    (route) =>
      route.layout === "/admin" &&
      !route.hidden &&
      (!route.adminOnly || isAdmin)
  );
  const active = visibleRoutes.find((route) =>
    location.pathname.endsWith(`/${route.path}`)
  );
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    t("common.user");
  const matches = query.trim()
    ? visibleRoutes.filter((route) =>
        t(`nav.${route.path}`)
          .toLocaleLowerCase(lang)
          .includes(query.toLocaleLowerCase(lang))
      )
    : [];
  useEffect(() => {
    setMobile(false);
    setQuery("");
  }, [location.pathname]);
  useEffect(() => {
    localStorage.setItem("forge_sidebar_collapsed", String(collapsed));
  }, [collapsed]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1000px)');
    const update = () => { setSmallScreen(media.matches); if (!media.matches) setMobile(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (mobile && smallScreen) closeButton.current?.focus(); }, [mobile, smallScreen]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setMobile(false);
        setQuery("");
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const routeLink = (route) => (
    <Link
      key={route.path}
      className={`forge-sidebar-link ${
        active?.path === route.path ? "is-active" : ""
      }`}
      aria-label={t(`nav.${route.path}`)}
      aria-current={active?.path === route.path ? "page" : undefined}
      title={collapsed ? t(`nav.${route.path}`) : undefined}
      to={`/${lang}/admin/${route.path}`}
      onClick={() => setMobile(false)}
    >
      <span>{route.icon}</span>
      <span className="forge-sidebar-label">{t(`nav.${route.path}`)}</span>
      {route.path === "converter" && (
        <span className="forge-sidebar-shortcut">↗</span>
      )}
    </Link>
  );
  return (
    <div
      className={`forge-root forge-app ${dark ? "" : "forge-light"} ${
        collapsed ? "is-collapsed" : ""
      }`}
    >
      {mobile && (
        <button
          className="forge-sidebar-backdrop"
          aria-label={t("studio.toggleMenu")}
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="forge-app-sidebar"
        inert={smallScreen && !mobile ? true : undefined}
        aria-hidden={smallScreen && !mobile ? true : undefined}
        className={`forge-app-sidebar ${mobile ? "is-mobile-open" : ""}`}
      >
        <Link className="forge-sidebar-brand" to={`/${lang}`}>
          <Brand compact={collapsed} />
        </Link>
        <button
          className="forge-sidebar-close forge-icon-btn"
          ref={closeButton}
          aria-label={t("studio.toggleMenu")}
          onClick={() => setMobile(false)}
        >
          <MdClose />
        </button>
        <div className="forge-workspace-switch">
          <span className="forge-workspace-icon">GS</span>
          <span>
            <strong>{t("forge.personalWorkspace")}</strong>
            <small>FREE PLAN</small>
          </span>
          <span>⌄</span>
        </div>
        <div className="forge-sidebar-group">
          <small className="forge-sidebar-group-title">
            {t("forge.createGroup")}
          </small>
          {visibleRoutes
            .filter((r) =>
              ["dashboard", "converter", "history", "prompts"].includes(r.path)
            )
            .sort(
              (a, b) =>
                ["dashboard", "converter", "history", "prompts"].indexOf(
                  a.path
                ) -
                ["dashboard", "converter", "history", "prompts"].indexOf(b.path)
            )
            .map(routeLink)}
        </div>
        <div className="forge-sidebar-group">
          <small className="forge-sidebar-group-title">
            {t("forge.discoverGroup")}
          </small>
          {visibleRoutes
            .filter(
              (r) =>
                ![
                  "dashboard",
                  "converter",
                  "history",
                  "prompts",
                  "profile",
                ].includes(r.path)
            )
            .map(routeLink)}
        </div>
        <div className="forge-sidebar-bottom">
          <div className="forge-sidebar-quota">
            <div>
              <MdBolt />
              <span>{t("forge.dailyEnergy")}</span>
              <strong>
                {remaining}
                <small> / {limit}</small>
              </strong>
            </div>
            <progress aria-label={t('forge.dailyEnergy')} value={Math.max(0, remaining)} max={limit || 1} />
            <p>{t("forge.quotaNote")}</p>
          </div>
          <Link
            className="forge-sidebar-link"
            to={`/${lang}`}
            title={t("forge.backHome")}
          >
            <MdHome />
            <span className="forge-sidebar-label">{t("forge.backHome")}</span>
          </Link>
          <div className="forge-sidebar-user">
            <Link to={`/${lang}/admin/profile`} aria-label={t("nav.profile")}>
              <span className="forge-user-avatar">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="forge-user-name">
                <strong>{displayName}</strong>
                <small>{t("forge.creatorAccount")}</small>
              </span>
            </Link>
            <button
              className="forge-icon-btn"
              aria-label={t("nav.logout")}
              onClick={signOut}
            >
              <MdLogout />
            </button>
          </div>
        </div>
        <button
          className="forge-collapse-toggle"
          aria-expanded={!collapsed}
          aria-label={t(
            collapsed ? "forge.expandSidebar" : "forge.collapseSidebar"
          )}
          onClick={() => setCollapsed(current => !current)}
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </aside>
      <div className="forge-app-main" inert={mobile && smallScreen ? true : undefined}>
        <header className="forge-app-topbar">
          <div className="forge-app-breadcrumb">
            <button
              ref={menuButton}
              className="forge-icon-btn forge-menu-toggle"
              aria-expanded={mobile}
              aria-controls="forge-app-sidebar"
              aria-label={t("studio.toggleMenu")}
              onClick={() => setMobile(!mobile)}
            >
              <MdMenu />
            </button>
            <span>{t("forge.workspace")}</span>
            <span>/</span>
            <strong>
              {active ? t(`nav.${active.path}`) : t("forge.workspace")}
            </strong>
          </div>
          <div className="forge-app-topbar-actions">
            <div className="forge-page-search">
              <label>
                <MdSearch />
                <input
                  aria-label={t("forge.searchPages")}
                  placeholder={t("forge.searchPages")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd>⌕</kbd>
              </label>
              {query && (
                <div className="forge-page-results">
                  {matches.length ? (
                    matches.map((route) => (
                      <Link
                        key={route.path}
                        to={`/${lang}/admin/${route.path}`}
                      >
                        {route.icon}
                        {t(`nav.${route.path}`)}
                        <MdArrowOutward />
                      </Link>
                    ))
                  ) : (
                    <p>{t("forge.noPageResults")}</p>
                  )}
                </div>
              )}
            </div>
            <ForgeControls dark={dark} toggle={toggle} />
            <Link
              className="forge-btn forge-btn-lime forge-top-create"
              to={`/${lang}/admin/converter`}
            >
              <MdAdd />
              {t("forge.newCreation")}
            </Link>
          </div>
        </header>
        <main className="forge-app-content">
          <Routes>
            {routes
              .filter((route) => route.layout === "/admin")
              .map((route) => (
                <Route
                  path={`/${route.path}`}
                  element={route.component}
                  key={route.path}
                />
              ))}
            <Route
              path="/"
              element={<Navigate to={`/${lang}/admin/dashboard`} replace />}
            />
          </Routes>
        </main>
        <footer className="forge-app-footer">
          <span>GS / CHARACTER LAB</span>
          <span>
            {t("forge.footerNote")} <span className="forge-status-dot" />
          </span>
        </footer>
      </div>
    </div>
  );
}
