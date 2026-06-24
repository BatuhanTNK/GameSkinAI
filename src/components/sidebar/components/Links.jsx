/* eslint-disable */
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { useAuth } from "contexts/AuthContext";
import { MdLogout } from "react-icons/md";

export function SidebarLinks(props) {
  let location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
    navigate("/auth/sign-in");
  };

  const createLinks = (routes) => {
    return routes
      .filter((route) => !route.hidden) // Hidden route'ları filtrele
      .filter((route) => route.layout === "/admin") // Sadece admin route'ları göster
      .map((route, index) => {
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li
                className="my-[3px] flex cursor-pointer items-center px-8"
                key={index}
              >
                <span
                  className={`${
                    activeRoute(route.path) === true
                      ? "font-bold text-brand-500 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.icon ? route.icon : <DashIcon />}{" "}
                </span>
                <p
                  className={`leading-1 ml-4 flex ${
                    activeRoute(route.path) === true
                      ? "font-bold text-navy-700 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.name}
                </p>
              </li>
              {activeRoute(route.path) ? (
                <div class="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
              ) : null}
            </div>
          </Link>
        );
      });
  };

  return (
    <>
      {createLinks(routes)}
      {/* Çıkış Yap butonu */}
      <div
        onClick={handleSignOut}
        className="relative mb-3 flex cursor-pointer hover:cursor-pointer"
      >
        <li className="my-[3px] flex cursor-pointer items-center px-8">
          <span className="font-medium text-gray-600">
            <MdLogout className="h-6 w-6" />
          </span>
          <p className="leading-1 ml-4 flex font-medium text-gray-600 hover:text-red-500 transition-colors duration-200">
            Çıkış Yap
          </p>
        </li>
      </div>
    </>
  );
}

export default SidebarLinks;
