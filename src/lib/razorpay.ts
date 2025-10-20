import Razorpay from "razorpay";
import crypto from "crypto";

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createOrder(params: CreateOrderParams) {
  const order = await razor.orders.create({
    amount: params.amount,
    currency: params.currency ?? "INR",
    receipt: params.receipt,
    notes: params.notes,
  });

  return order;
}

export function verifySignature(payload: string, signature: string, secret: string) {
  // Razorpay provides utility but we can implement HMAC verification here
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}

// Placeholder functions for subscription-like behavior
export async function createCustomer(_email: string, _name?: string): Promise<string> {
  // Razorpay doesn't have customers in the same way; return a placeholder ID
  return `rzp_${Date.now()}`;
}

export default razor;
