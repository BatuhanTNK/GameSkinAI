/**
 * @fileoverview Uygulama route tanımları.
 * Sidebar menü öğelerini ve sayfa bileşenlerini eşler.
 */

import React from "react";

// Admin Imports
import Converter from "views/admin/converter";
import Dashboard from "views/admin/dashboard";
import History from "views/admin/history";
import Profile from "views/admin/profile";
import Marketplace from "views/admin/marketplace";
import PromptLibrary from "views/admin/prompts";
import AdminPanel from "views/admin/adminpanel";
import ChallengePage from "views/admin/challenge";
import LandingPage from "views/landing";

// Auth Imports
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";
import ForgotPassword from "views/auth/ForgotPassword";
import ResetPassword from "views/auth/ResetPassword";

// Icon Imports
import {
  MdAutoAwesome,
  MdHistory,
  MdPerson,
  MdStorefront,
  MdLock,
  MdPersonAdd,
  MdKey,
  MdHome,
  MdDashboard,
  MdLibraryBooks,
  MdAdminPanelSettings,
  MdEmojiEvents,
} from "react-icons/md";

const routes = [
  {
    name: "Anasayfa / Vitrin",
    layout: "",
    path: "",
    icon: <MdHome className="h-6 w-6" />,
    component: <LandingPage />,
    hidden: true,
  },
  {
    name: "Dönüştürücü",
    layout: "/admin",
    path: "converter",
    icon: <MdAutoAwesome className="h-6 w-6" />,
    component: <Converter />,
  },
  {
    name: "İstatistiklerim",
    layout: "/admin",
    path: "dashboard",
    icon: <MdDashboard className="h-6 w-6" />,
    component: <Dashboard />,
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
    name: "Haftalık Yarışma",
    layout: "/admin",
    path: "challenge",
    icon: <MdEmojiEvents className="h-6 w-6" />,
    component: <ChallengePage />,
  },
  {
    name: "Prompt Kütüphanesi",
    layout: "/admin",
    path: "prompts",
    icon: <MdLibraryBooks className="h-6 w-6" />,
    component: <PromptLibrary />,
  },
  {
    name: "Profilim",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  {
    name: "Admin Paneli",
    layout: "/admin",
    path: "adminpanel",
    icon: <MdAdminPanelSettings className="h-6 w-6" />,
    component: <AdminPanel />,
    adminOnly: true,
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
  {
    name: "Şifre Sıfırla",
    layout: "/auth",
    path: "reset-password",
    icon: <MdKey className="h-6 w-6" />,
    component: <ResetPassword />,
    hidden: true,
  },
];


export default routes;
