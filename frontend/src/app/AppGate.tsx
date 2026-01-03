// src/app/AppGate.tsx
import React from "react";
import { useAuth } from "../contexts/auth/AuthContext";
import { useEntitlements } from "../contexts/entitlements/EntitlementsContext";
import { useFlags } from "../contexts/flags/FlagsContext";

import { AdminPath } from "./paths/AdminPath";
import { MemberPath } from "./paths/MemberPath";
import { PublicPath } from "./paths/PublicPath";

export const AppGate: React.FC = () => {
  const { auth } = useAuth();
  const { flags } = useFlags();
  const { entitlements } = useEntitlements();

  // Parallel Path #1: Unauthenticated users
  if (auth.status === "anonymous") {
    return <PublicPath />;
  }

  // Conditional requirement for admin path:
  // must be admin AND feature flag enabled AND entitlement allows it
  const canEnterAdminPath =
    auth.user?.role === "Administrator" && flags.enableAdminTools && entitlements.canUseAdminTools;

  // Parallel Path #2: Admin experience
  if (canEnterAdminPath) {
    return <AdminPath />;
  }

  // Parallel Path #3: Standard member experience, with flag-based variants inside
  return <MemberPath enableNewDashboard={flags.enableNewDashboard} />;
};
