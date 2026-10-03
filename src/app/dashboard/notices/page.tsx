"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { RoleGate } from "@/components/RoleGate";

export default function NoticesPage() {
  return (
    <RoleGate allow={["SECRETARY", "SOMITI_ADMIN", "BRANCH_MANAGER"]}>
      <ComingSoon titleKey="modules.notices.title" descriptionKey="modules.notices.description" />
    </RoleGate>
  );
}
