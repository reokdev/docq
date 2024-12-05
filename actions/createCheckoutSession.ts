"use server";

import { UserDetails } from "@/app/dashboard/upgrade/page";
import { adminDb } from "@/firebaseAdmin";
import getBaseUrl from "@/lib/getBaseUrl";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function createCheckoutSession(userDetails: UserDetails) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  //   first check if the user already has a stripeCustomerId
  let stripeCustomerId

  const user = await adminDb.collection("users").doc(userId).get();
  stripeCustomerId = user.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    // Create a new Stripe customer if none exists
    const customer = await stripe.customers.create({
      email: user.data()?.email, // Use the user's email from Firebase
    });
  
    stripeCustomerId = customer.id; // Get the new Stripe customer ID

    // Update the user's document in Firebase with the new Stripe customer ID
    await adminDb.collection("users").doc(userId).update({
      stripeCustomerId: stripeCustomerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1QSR1WKStayc1Yz2JA3IGrxo",
        quantity: 1,
      },
    ],
    mode: "subscription",
    customer: stripeCustomerId,
    success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
    cancel_url: `${getBaseUrl()}/upgrade`,
  });

  return session.id;
}