// Compatibility shim: previously used Stripe. Now using Razorpay.
// This file keeps the same exported function signatures so other modules
// can continue to import from '@/lib/stripe' without changes.
import {
  createOrder,
  createCustomer as rzpCreateCustomer,
} from "@/lib/razorpay";

export interface CreateCheckoutSessionParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  // For Razorpay, create an order and return an order id or a hosted page URL
  const amountPaise = Math.round((params.metadata?.amount ? Number(params.metadata.amount) : 0) * 100);
  const order = await createOrder({ amount: amountPaise || 100, currency: "INR", receipt: params.metadata?.receipt, notes: params.metadata });
  // Return order id as fallback
  return order.id;
}

export async function createBillingPortalSession(_customerId: string, _returnUrl: string): Promise<string> {
  // Razorpay does not have a billing portal equivalent. Return a placeholder URL or support link.
  return process.env.NEXT_PUBLIC_APP_URL! + "/dashboard/settings/billing";
}

export async function createCustomer(params: { email: string; name?: string; metadata?: Record<string, string>; }): Promise<string> {
  return await rzpCreateCustomer(params.email, params.name);
}

export async function cancelSubscription(_subscriptionId: string): Promise<void> {
  // Razorpay supports subscription cancellation via API; implement later if needed.
}

export async function resumeSubscription(_subscriptionId: string): Promise<void> {
  // Implement resume logic if using Razorpay subscriptions
}
