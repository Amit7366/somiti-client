"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { RoleGate } from "@/components/RoleGate";

export default function CollectionsPage() {
  return (
    <RoleGate allow={["CASHIER", "FIELD_OFFICER", "BRANCH_MANAGER", "SOMITI_ADMIN"]}>
      <ComingSoon
        titleKey="modules.collections.title"
        descriptionKey="modules.collections.description"
      />
    </RoleGate>
  );
}
