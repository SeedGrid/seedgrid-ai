import { Suspense } from "react";

import { SelfEnterView } from "../SelfEnterView";

// Link do convite do ext-security: {frontend.base-url}/auth/self-enter?token=...
export default function SelfEnterPage() {
  return (
    <Suspense fallback={null}>
      <SelfEnterView />
    </Suspense>
  );
}
