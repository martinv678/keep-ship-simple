import Stripe from "stripe";

type CreateCheckoutSessionParams = {
  customerId: string;
  pendingPhraseId: string;
  userId: string;
};

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function createCustomer({ email }: { email: string }) {
  return stripe.customers.create({
    email,
  });
}

export async function createCheckoutSession({
  customerId,
  pendingPhraseId,
  userId,
}: CreateCheckoutSessionParams) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID as string,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      pendingPhraseId,
      userId,
    },
  });
}

export { stripe };
