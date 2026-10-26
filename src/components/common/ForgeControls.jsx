import React from "react";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { useTranslation } from "contexts/TranslationContext";
import LanguageSwitcher from "components/common/LanguageSwitcher";

export default function ForgeControls({ dark, toggle }) {
  const { t } = useTranslation();
  return (
    <div className="forge-controls">
      <LanguageSwitcher size="sm" />
      <button
        className="forge-icon-btn"
        onClick={toggle}
        aria-label={t(dark ? "studio.lightMode" : "studio.darkMode")}
      >
        {dark ? <RiSunLine /> : <RiMoonLine />}
      </button>
    </div>
  );
}
