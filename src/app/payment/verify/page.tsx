"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Update the import path below if your toast utility is located elsewhere
import { toast } from "sonner";
import { verifyPayment } from "../../data/queries";

export default function PaymentVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) {
        toast.error("Payment reference not found in URL.");
        return;
      }

      try {
        // 👇 call your backend to verify
        await verifyPayment(reference);
        toast.success("Your payment was successful.");
        const redirectUrl =
          localStorage.getItem("pendingRedirectUrl") || "/new-application";

        router.replace(`${redirectUrl}?step=finish`);
      } catch (error) {
        toast.error("We could not verify your payment.");
        console.error("Payment verification error:", error);
      }
    };

    verify();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Verifying payment...</p>
      </div>
    </div>
  );
}
