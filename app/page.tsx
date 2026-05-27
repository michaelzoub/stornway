import { LanguageProvider } from "@/lib/i18n/language-provider";
import { HomePage } from "./home-page";

export default function Page() {
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  );
}
