"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { RoleGate } from "@/components/RoleGate";

export default function LedgerPage() {
  return (
    <RoleGate allow={["ACCOUNTANT", "SOMITI_ADMIN"]}>
      <ComingSoon titleKey="modules.ledger.title" descriptionKey="modules.ledger.description" />
    </RoleGate>
  );
}
