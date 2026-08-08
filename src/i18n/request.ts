import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessagesForLocale } from "@/lib/messages.server";
import { resolveAppLocale } from "@/lib/locale";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = resolveAppLocale(requested ?? routing.defaultLocale);

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
