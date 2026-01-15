import { AdvancedThemeCustomizer } from "@/components/theme/AdvancedThemeCustomizer";
import type { Route } from "./+types/theme";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Theme Settings - LexiFlow" },
    { name: "description", content: "Customize the application theme with 150+ options" },
  ];
}

export default function ThemeSettings() {
  return <AdvancedThemeCustomizer />;
}
