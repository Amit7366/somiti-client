"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { RoleGate } from "@/components/RoleGate";

export default function AccountPage() {
  return (
    <RoleGate allow={["MEMBER"]}>
      <ComingSoon titleKey="modules.account.title" descriptionKey="modules.account.description" />
    </RoleGate>
  );
}
