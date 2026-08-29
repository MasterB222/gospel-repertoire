import { useTranslation } from "react-i18next";
import { LifeBuoy, Mail } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface HelpSection {
  title: string;
  items: string[];
}

export function Help() {
  const { t } = useTranslation("pages");
  useDocumentTitle(t("help.title"));
  const sections = t("help.sections", { returnObjects: true }) as HelpSection[];

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <LifeBuoy size={22} className="text-accent-ink" />
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("help.title")}</h1>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="p-4">
            <h2 className="mb-2 font-serif text-base font-semibold text-ink">{section.title}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-4 flex items-center gap-2 p-4 text-sm text-muted">
        <Mail size={16} className="text-accent-ink" />
        {t("help.contact")}
      </Card>
    </div>
  );
}
