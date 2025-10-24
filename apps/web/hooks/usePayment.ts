"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/app/config";

const apiUrl = BACKEND_URL;

// Event bus for credit updates
export const creditUpdateEvent = new EventTarget();

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const handlePayment = async (plan: "starter" | "pro" | "premium") => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${apiUrl}/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, method: "dodopayments" }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.message || "Payment session creation failed");
      }

      // Redirect user to Dodo checkout page
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
//      window.location.href = "/payment/cancel";
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePayment, isLoading };
}

