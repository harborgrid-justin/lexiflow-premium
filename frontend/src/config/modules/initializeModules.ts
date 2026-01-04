import { ModuleRegistry } from "@/services/infrastructure/moduleRegistry";
import { ModuleDefinition } from "@/types/misc";
import { FilePlus, UserCircle } from "lucide-react";
import { NAVIGATION_ITEMS } from "../nav.config";
import { PATHS } from "../paths.config";
import { COMPONENT_MAP } from "./componentMap";
import { NewCasePage, UserProfileManager } from "./lazyComponents";

export const initializeModules = () => {
  const modules = NAVIGATION_ITEMS.flatMap((item) => {
    const { children, ...itemWithoutChildren } = item;
    const component = COMPONENT_MAP[item.id];
    if (!component) return [];

    const mainModule: ModuleDefinition = {
      ...itemWithoutChildren,
      component,
    };

    if (children && children.length > 0) {
      const childModules = children
        .map((child) => {
          const childComponent = COMPONENT_MAP[child.id];
          if (!childComponent) return null;
          return {
            id: child.id,
            label: child.label,
            icon: child.icon,
            category: item.category,
            component: childComponent,
            hidden: true,
          } as ModuleDefinition;
        })
        .filter((m): m is ModuleDefinition => m !== null);
      return [mainModule, ...childModules];
    }

    return [mainModule];
  });

  ModuleRegistry.registerBatch(modules);

  ModuleRegistry.register({
    id: PATHS.CREATE_CASE,
    label: "New Case",
    icon: FilePlus,
    category: "Case Work",
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
