import { prismaClient } from "db";
import { PlanType } from "@prisma/client";
import DodoPayments from "dodopayments"; // replace with actual SDK import

// Initialize Dodo Payments client
console.log("this is the dodo payment api, ", process.env.DODO_PAYMENTS_API_KEY);
const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode"
});

/**
 * Define plan prices (for DB records)
 */
export const PLAN_PRICES = {
  starter: 19,
  pro: 49,
  premium: 99,
} as const;

/**
 * Define credit amounts per plan
 */
export const CREDITS_PER_PLAN = {
  starter: 50,
  pro: 1000,
  premium: 3000,
} as const;

/**
 * Create a transaction record
 */
export async function createTransactionRecord(
  userId: string,
  amount: number,
  currency: string,
  paymentId: string,
  orderId: string,
  plan: PlanType,
  status: "PENDING" | "SUCCESS" | "FAILED" = "PENDING"
) {
  try {
	  console.log('this is the plan ', plan);
    return await prismaClient.transaction.create({
      data: {
        userId,
        amount,
        currency,
        paymentId, // keep original field
        orderId,   // keep original field
        plan,
        status,
      },
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    throw error;
  }
}

/**
 * Create a Dodo Payments checkout session
 */
const productMap = {
  starter: "pdt_sJEYn4JkI01dlNy199xHu",
  pro: "pdt_tCzf3sO6UUs9tUfDu2leh",
  premium: "pdt_eSyFxtDXLPad8KOlgPSum",
};

export async function createDodoPaymentSession(
  userId: string,
  plan: "starter" | "pro" | "premium",
  name: string,
  email: string
) {
  try {
	  console.log("dodo payments api key: ", process.env.DODO_PAYMENTS_API_KEY);
    const amount = PLAN_PRICES[plan];

    // Create checkout session via Dodo SDK
    const checkout = await dodo.checkoutSessions.create({
  product_cart: [{ product_id: productMap[plan], quantity: 1 }],
  customer: {name, email},
  return_url: 'https://pixorai.picaistudio.com/',
  metadata: {userId, plan}
});

	console.log("dodo payment checkout ", checkout);
    // Create pending transaction in DB
    await createTransactionRecord(
      userId,
      amount,
      "USD",
      checkout.session_id, // paymentId
      checkout.session_id, // orderId (or any identifier you want)
      plan,
      "PENDING"
    );

    // Return checkout URL to frontend
    return checkout.checkout_url;
  } catch (error) {
    console.error("Dodo payment session creation error:", error);
    throw error;
  }
}

/**
 * Add credits for a user based on plan
 */
export async function addCreditsForPlan(userId: string, plan: PlanType) {
  try {
    // @ts-ignore
    const credits = CREDITS_PER_PLAN[plan];
    return await prismaClient.userCredit.upsert({
      where: { userId },
      update: { amount: { increment: credits } },
      create: { userId, amount: credits },
    });
  } catch (error) {
    console.error("Credit addition error:", error);
    throw error;
  }
}

/**
 * Create a subscription record and add credits
 */
export async function createSubscriptionRecord(
  userId: string,
  plan: PlanType,
  paymentId: string,
  orderId: string
) {
  try {
    return await prismaClient.$transaction(async (prisma) => {
      const subscription = await prisma.subscription.create({
        data: { userId, plan, paymentId, orderId },
      });

      await addCreditsForPlan(userId, plan);
      return subscription;
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    throw error;
  }
}

/**
 * Payment Service object
 */
export const PaymentService = {
  createDodoPaymentSession,
  createTransactionRecord,
  addCreditsForPlan,
  createSubscriptionRecord,
};

