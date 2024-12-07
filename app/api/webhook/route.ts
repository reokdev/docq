import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('=== WEBHOOK START ===', new Date().toISOString());
  
  const rawBody = await req.text();
  const signature = headers().get("stripe-signature");
  
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing signature or webhook secret');
    return new NextResponse("Configuration error", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('=== EVENT RECEIVED ===', event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;

      console.log('Processing completed session:', {
        userId,
        customerId,
        sessionId: session.id
      });

      if (!userId) {
        throw new Error('No userId in session metadata');
      }

      await adminDb.collection("users").doc(userId).update({
        hasActiveMembership: true,
        stripeCustomerId: customerId,
        updatedAt: new Date().toISOString(),
      });

      console.log('Successfully updated user:', userId);
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