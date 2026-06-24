/**
 * @fileoverview Uygulama route tanımları.
 * Sidebar menü öğelerini ve sayfa bileşenlerini eşler.
 */

import React from "react";

// Admin Imports
import Converter from "views/admin/converter";
import History from "views/admin/history";

// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";

// Icon Imports
import {
  MdAutoAwesome,
  MdHistory,
  MdLock,
  MdPersonAdd,
} from "react-icons/md";

const routes = [
  {
    name: "Dönüştürücü",
    layout: "/admin",
    path: "converter",
    icon: <MdAutoAwesome className="h-6 w-6" />,
    component: <Converter />,
  },
  {
    name: "Geçmişim",
    layout: "/admin",
    path: "history",
    icon: <MdHistory className="h-6 w-6" />,
    component: <History />,
  },
  {
    name: "Giriş Yap",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    hidden: true, // Sidebar'da gösterme
  },
  {
    name: "Kayıt Ol",
    layout: "/auth",
    path: "sign-up",
    icon: <MdPersonAdd className="h-6 w-6" />,
    component: <SignUp />,
    hidden: true, // Sidebar'da gösterme
  },
];

export default routes;
