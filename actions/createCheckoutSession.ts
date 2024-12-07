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

  // First check if the user already has a stripeCustomerId
  let stripeCustomerId;

  const userRef = adminDb.collection("users").doc(userId);
  const user = await userRef.get();
  
  if (!user.exists) {
    // Create the user document if it doesn't exist
    await userRef.set({
      email: userDetails.email,
      name: userDetails.name,
      hasActiveMembership: false,
      createdAt: new Date().toISOString(),
    });
  }

  stripeCustomerId = user.exists ? user.data()?.stripeCustomerId : null;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1QTQ1KKStayc1Yz2DtVsi7tA",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
      cancel_url: `${getBaseUrl()}/upgrade`,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        userId: userId,
      },
      ...(stripeCustomerId 
        ? { customer: stripeCustomerId } 
        : { customer_email: userDetails.email }
      ),
    });

    return session.id;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session');
  }
}