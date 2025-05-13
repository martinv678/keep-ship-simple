import { Router } from "express";
import express from "express";
import { stripe } from "../stripe";
import type { Stripe } from "stripe";

const stripeRouter = Router();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);

      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata) {
          res.status(400).send("No metadata found");

          return;
        }

        // DO YOUR STUFF HERE

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

export { stripeRouter };
