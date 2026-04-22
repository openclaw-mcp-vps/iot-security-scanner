import { Suspense } from "react";

import { AccessActivation } from "@/components/AccessActivation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function AccessSuccessPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <Card className="border-slate-800 bg-slate-950/60">
              <CardContent className="p-6 text-sm text-slate-300">
                Preparing secure activation flow...
              </CardContent>
            </Card>
          }
        >
          <AccessActivation />
        </Suspense>
      </main>
    </div>
  );
}
