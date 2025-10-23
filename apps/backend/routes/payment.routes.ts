import express from "express";
import { authMiddleware } from "../middleware";
import { PlanType } from "@prisma/client";
import { prismaClient } from "db";
import { PaymentService } from "../services/payment";
import { Webhook } from "standardwebhooks";
import bodyParser from "body-parser";

const router = express.Router();

/**
 * Create payment session (Dodo Payments)
 */
router.post("/create", authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { plan } = req.body;
    console.log("this is the request body for dodo, ", req.body);
    const userId = req.userId!;
    const user = (req as any).user;
	console.log("dodo create request userID, ",userId);
	console.log("dodo create this is the user ", user);
	
    if (!userId || !user?.email) {
      return res.status(400).json({ message: "User information missing" });
    }

    if (!plan || !["basic", "premium"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Create Dodo payment session
    const checkoutUrl = await PaymentService.createDodoPaymentSession(
      userId,
      plan,
      user.email,
      user.email
    );

    return res.json({ checkout_url: checkoutUrl });
  } catch (error) {
    console.error("Payment creation error:", error);
    return res.status(500).json({
      message: "Error creating payment session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Webhook for Dodo Payments
 */
/**
 * Webhook for Dodo Payments
 */

router.post(
  "/webhook/dodo",
  async (req, res) => {
    try {
      const body = req.body;
      const webhook_secret=process.env.DODO_WEBHOOK_KEY;
      console.log('this is the webhook secret, ',webhook_secret);

      const webhook = new Webhook(webhook_secret);
    const webhookHeaders: WebhookUnbrandedRequiredHeaders = {
      "webhook-id": (req.headers["webhook-id"] || "") as string,
      "webhook-signature": (req.headers["webhook-signature"] || "") as string,
      "webhook-timestamp": (req.headers["webhook-timestamp"] || "") as string,
    };

    const raw = JSON.stringify(body);

    const samePayloadOutput = await webhook.verify(raw, webhookHeaders);
    console.log('this is the same payload output ', samePayloadOutput);
      const payload = body; // Use the verified payload
      console.log('this is the payload ', payload);

      
      console.log("✅ Dodo webhook event received:", payload.type);

      switch (payload.type) {
        case "payment.succeeded": {
          // const { payment_id, order_id, user_id, plan } = payload.data;
	  const payment_id = payload.data.checkout_session_id;
	  const order_id = payload.data.checkout_session_id;
	  const user_id = payload.data.metadata?.userId;
	  const plan = payload.data.metadata?.plan;

          if (!payment_id || !order_id || !user_id || !plan)
            return res.status(400).json({ error: "Missing payment fields" });
		console.log('updating the transaction status');
          await prismaClient.transaction.updateMany({
            where: { orderId: order_id, userId: user_id },
            data: { paymentId: payment_id, status: "SUCCESS" },
          });

          await PaymentService.createSubscriptionRecord(
            user_id,
            plan,
            payment_id,
            order_id
          );

          break;
        }

        case "payment.failed": {
          // const { payment_id, order_id, user_id } = payload.data;
	  const payment_id = payload.data.checkout_session_id;
          const order_id = payload.data.checkout_session_id;
          const user_id = payload.data.metadata?.userId;
          const plan = payload.data.metadata?.plan;

          if (!payment_id || !order_id || !user_id)
            return res.status(400).json({ error: "Missing payment fields" });

          await prismaClient.transaction.updateMany({
            where: { orderId: order_id, userId: user_id },
            data: { status: "FAILED" },
          });

          break;
        }

        default:
          console.log("Unhandled webhook event:", payload.type);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Dodo webhook error:", error);
      return res.status(500).json({
        error: "Internal webhook processing error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);


/**
 * Get user subscription
 */
router.get("/subscription/:userId", async (req: express.Request, res: express.Response) => {
  try {
    const subscription = await prismaClient.subscription.findFirst({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
      select: { plan: true, createdAt: true },
    });

    res.json({ subscription: subscription || null });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: "Error fetching subscription status" });
  }
});

/**
 * Get user credits
 */
router.get("/credits/:userId", async (req: express.Request, res: express.Response) => {
  try {
    const userCredit = await prismaClient.userCredit.findUnique({
      where: { userId: req.params.userId },
      select: { amount: true },
    });

    res.json({ credits: userCredit?.amount || 0 });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ message: "Error fetching credits" });
  }
});

/**
 * List user transactions
 */
router.get("/transactions", authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId: (req as any).userId! },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

