import { ThemeCustomizer } from "@/theme";
import type { Route } from "./+types/theme";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Theme Settings - LexiFlow" },
    { name: "description", content: "Customize the application theme" },
  ];
}

export default function ThemeSettings() {
  return <ThemeCustomizer />;
}
