import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('=== WEBHOOK START ===', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
  
  const rawBody = await req.text();
  const signature = headers().get("stripe-signature");
  
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing signature or webhook secret');
    console.log('Signature:', signature);
    console.log('Secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
    return new NextResponse("Configuration error", { status: 401 });
  }

  let event: Stripe.Event;

  try {
    console.log('Attempting to verify webhook...');
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook verified successfully');
    
    console.log('=== EVENT RECEIVED ===', event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Full session data:", JSON.stringify(session, null, 2));
      
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;

      if (!userId) {
        console.error("No userId in metadata");
        throw new Error('No userId in session metadata');
      }

      const userRef = adminDb.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error("User document not found:", userId);
        throw new Error('User document not found');
      }

      console.log('Current user data:', userDoc.data());

      await userRef.update({
        hasActiveMembership: true,
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await userRef.get();
      console.log('Updated user data:', updatedDoc.data());
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      { status: 400 }
    );
  }
} 