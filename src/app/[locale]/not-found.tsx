import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default async function NotFoundPage() {
  const t = await getTranslations("common");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Logo variant="compact" className="mx-auto mb-6 h-14" />
        <h1 className="font-display text-8xl md:text-9xl font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
          {t("notFound")}
        </h2>
        <p className="text-muted mb-8 max-w-md mx-auto">{t("notFoundDesc")}</p>
        <Button asChild size="lg">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
