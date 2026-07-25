/**
 * @fileoverview Uygulama route tanımları.
 * Sidebar menü öğelerini ve sayfa bileşenlerini eşler.
 */

import React from "react";

// Admin Imports
import Converter from "views/admin/converter";
import History from "views/admin/history";
import Profile from "views/admin/profile";
import Marketplace from "views/admin/marketplace";

// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";
import ForgotPassword from "views/auth/ForgotPassword";

// Icon Imports
import {
  MdAutoAwesome,
  MdHistory,
  MdPerson,
  MdStorefront,
  MdLock,
  MdPersonAdd,
  MdKey,
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
    name: "Topluluk Galerisi",
    layout: "/admin",
    path: "marketplace",
    icon: <MdStorefront className="h-6 w-6" />,
    component: <Marketplace />,
  },
  {
    name: "Profilim",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },

  {
    name: "Giriş Yap",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    hidden: true,
  },
  {
    name: "Kayıt Ol",
    layout: "/auth",
    path: "sign-up",
    icon: <MdPersonAdd className="h-6 w-6" />,
    component: <SignUp />,
    hidden: true,
  },
  {
    name: "Şifremi Unuttum",
    layout: "/auth",
    path: "forgot-password",
    icon: <MdKey className="h-6 w-6" />,
    component: <ForgotPassword />,
    hidden: true,
  },
];


export default routes;
