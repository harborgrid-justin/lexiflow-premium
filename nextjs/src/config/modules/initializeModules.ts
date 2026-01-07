import { ModuleRegistry } from "@/services/infrastructure/moduleRegistry";
import { FilePlus, UserCircle } from "lucide-react";
import { NAVIGATION_ITEMS } from "../nav.config";
import { PATHS } from "../paths.config";
import { COMPONENT_MAP } from "./componentMap";
import { NewCasePage, UserProfileManager } from "./lazyComponents";

export const initializeModules = () => {
  const modules = NAVIGATION_ITEMS.flatMap((item) => {
    const { children, ...itemWithoutChildren } = item;
    const mainModule = {
      ...itemWithoutChildren,
      component: COMPONENT_MAP[item.id],
    };

    if (children && children.length > 0) {
      const childModules = children.map((child) => ({
        id: child.id,
        label: child.label,
        icon: child.icon,
        category: item.category,
        component: COMPONENT_MAP[child.id],
        hidden: true,
      }));
      return [mainModule, ...childModules];
    }

    return [mainModule];
  }).filter((m) => m.component !== undefined);

  ModuleRegistry.registerBatch(modules);

  ModuleRegistry.register({
    id: PATHS.CREATE_CASE,
    label: "New Case",
    icon: FilePlus,
    category: "Matters",
    component: NewCasePage,
    hidden: true,
  });

  ModuleRegistry.register({
    id: PATHS.PROFILE,
    label: "My Profile",
    icon: UserCircle,
    category: "Admin",
    component: UserProfileManager,
    hidden: true,
  });
};
