"use client";

import { ComingSoon } from "@/components/ComingSoon";
import { RoleGate } from "@/components/RoleGate";

export default function CashbookPage() {
  return (
    <RoleGate allow={["CASHIER", "ACCOUNTANT", "SOMITI_ADMIN"]}>
      <ComingSoon titleKey="modules.cashbook.title" descriptionKey="modules.cashbook.description" />
    </RoleGate>
  );
}
