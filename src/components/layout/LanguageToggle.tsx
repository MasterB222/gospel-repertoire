import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import clsx from "clsx";
import { linkClasses } from "./navLinks";

export function LanguageToggle({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const next = i18n.language === "en" ? "fr" : "en";

  return (
    <button onClick={() => i18n.changeLanguage(next)} className={clsx(linkClasses(false), "w-full", className)}>
      <Languages size={18} strokeWidth={1.8} aria-hidden="true" />
      {t(`language.${next}`)}
    </button>
  );
}
