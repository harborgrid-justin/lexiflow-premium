import { AdvancedThemeCustomizer } from "@/components/theme/AdvancedThemeCustomizer";
export function meta() {
  return [
    { title: "Theme Settings - LexiFlow" },
    { name: "description", content: "Customize the application theme with 150+ options" },
  ];
}

export default function ThemeSettings() {
  return <AdvancedThemeCustomizer />;
}
